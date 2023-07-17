import { ethers } from "hardhat";
import { expect } from "chai";
import { deployMockContract, MockContract } from "ethereum-waffle";

import { Organization } from "../../typechain-types";
import { getRandomProfileId, impersonateContract, stopImpersonatingContract, waitForTx } from "../helpers/utils";
import { Signer } from "ethers";

const FAKE_METADATA_URI = "urn:dev:fake";

describe("Organization", () => {
  let hub: MockContract;
  let contract: Organization;

  let deployer: Signer;
  let deployerAddress: string;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    deployerAddress = await deployer.getAddress();

    const hubFactory = await ethers.getContractFactory("My3SecHub", deployer);
    hub = await deployMockContract(deployer, hubFactory.interface.format() as string[]);

    await hub.mock.emitPendingMemberApproved.returns();
    await hub.mock.emitPendingMemberRejected.returns();
    await hub.mock.emitProjectCreated.returns();
    await hub.mock.emitProjectUpdated.returns();
    await hub.mock.emitProjectMemberAdded.returns();
    await hub.mock.emitProjectMemberRemoved.returns();
    await hub.mock.emitTaskCreated.returns();
    await hub.mock.emitTaskUpdated.returns();
    await hub.mock.emitTaskMemberAdded.returns();
    await hub.mock.emitTaskMemberRemoved.returns();

    const contractFactory = await ethers.getContractFactory("Organization");
    contract = await contractFactory.deploy(hub.address, FAKE_METADATA_URI);

    await contract.addToWhitelist(hub.address);
    await contract.addToWhitelist(deployerAddress);
  });

  describe("Deployment", () => {
    it("should have store the metadata uri", async () => {
      const metadataUri = await contract.getMetadataURI();
      expect(metadataUri).to.be.equal(FAKE_METADATA_URI);
    });

    it("should have initial member count to zero", async () => {
      const memberCount = await contract.getMemberCount();
      expect(memberCount).to.be.equal(0);
    });

    it("should have initial pending member count to zero", async () => {
      const pendingMemberCount = await contract.getPendingMemberCount();
      expect(pendingMemberCount).to.be.equal(0);
    });
  });

  describe("join", () => {
    it("should let a profile join", async () => {
      const profileId = getRandomProfileId();

      const hubSigner = await impersonateContract(hub.address);
      await contract.connect(hubSigner).join(profileId);
      await stopImpersonatingContract(hub.address);

      const pendingMemberCount = await contract.getPendingMemberCount();
      const isMember = await contract.isMember(profileId);
      expect(pendingMemberCount).to.be.equal(1);
      expect(isMember).to.be.false;
    });

    it("should not add twice a profile if is pending", async () => {
      const profileId = getRandomProfileId();

      const hubSigner = await impersonateContract(hub.address);
      await contract.connect(hubSigner).join(profileId);
      await contract.connect(hubSigner).join(profileId);
      await stopImpersonatingContract(hub.address);

      const pendingMemberCount = await contract.getPendingMemberCount();
      const isMember = await contract.isMember(profileId);
      expect(pendingMemberCount).to.be.equal(1);
      expect(isMember).to.be.false;
    });

    describe("approvePendingMember", () => {
      it("should approve joined member", async () => {
        const profileId = getRandomProfileId();

        const hubSigner = await impersonateContract(hub.address);
        await contract.connect(hubSigner).join(profileId);
        await stopImpersonatingContract(hub.address);

        let pendingMembers = await contract.getPendingMemberCount();
        expect(pendingMembers).to.be.equal(1);

        await contract.approvePendingMember(profileId);

        const memberCount = await contract.getMemberCount();
        const isMember = await contract.isMember(profileId);
        pendingMembers = await contract.getPendingMemberCount();
        expect(memberCount).to.be.equal(1);
        expect(pendingMembers).to.be.equal(0);
        expect(isMember).to.be.true;
      });

      it("should revert if is not a pending member", async () => {
        const profileId = getRandomProfileId();

        const pendingMembers = contract.approvePendingMember(profileId);
        await expect(pendingMembers).to.be.revertedWithCustomError(contract, "NotPendingMember");
      });

      it("should revert if is already a member", async () => {
        const profileId = getRandomProfileId();

        const hubSigner = await impersonateContract(hub.address);
        await contract.connect(hubSigner).join(profileId);
        await stopImpersonatingContract(hub.address);

        await contract.approvePendingMember(profileId);

        const pendingMembers = contract.approvePendingMember(profileId);
        await expect(pendingMembers).to.be.revertedWithCustomError(contract, "NotPendingMember");
      });

      describe("leave", () => {
        it("should let a member leave", async () => {
          const profileId = getRandomProfileId();

          let hubSigner = await impersonateContract(hub.address);
          await contract.connect(hubSigner).join(profileId);
          await stopImpersonatingContract(hub.address);

          await contract.approvePendingMember(profileId);

          hubSigner = await impersonateContract(hub.address);
          await contract.connect(hubSigner).leave(profileId);
          await stopImpersonatingContract(hub.address);

          const memberCount = await contract.getMemberCount();
          const isMember = await contract.isMember(profileId);
          expect(memberCount).to.be.equal(0);
          expect(isMember).to.be.false;
        });

        it("should let a member leave also if his only pending", async () => {
          const profileId = getRandomProfileId();

          const hubSigner = await impersonateContract(hub.address);
          await contract.connect(hubSigner).join(profileId);
          await contract.connect(hubSigner).leave(profileId);
          await stopImpersonatingContract(hub.address);

          const pendingMemberCount = await contract.getPendingMemberCount();
          const isMember = await contract.isMember(profileId);
          expect(pendingMemberCount).to.be.equal(0);
          expect(isMember).to.be.false;
        });

        it("should revert if not a member", async () => {
          const profileId = getRandomProfileId();

          const hubSigner = await impersonateContract(hub.address);
          const leave = contract.connect(hubSigner).leave(profileId);

          await expect(leave).to.be.revertedWithCustomError(contract, "NotMember");

          await stopImpersonatingContract(hub.address);
        });
      });
    });

    describe("rejectPendingMember", () => {
      it("should reject pending member", async () => {
        const profileId = getRandomProfileId();

        const hubSigner = await impersonateContract(hub.address);
        await contract.connect(hubSigner).join(profileId);
        await stopImpersonatingContract(hub.address);

        await contract.rejectPendingMember(profileId);

        const pendingMembers = await contract.getPendingMemberCount();
        expect(pendingMembers).to.be.equal(0);
      });

      it("should revert when rejecting a not pending member", async () => {
        const profileId = getRandomProfileId();

        const reject = contract.rejectPendingMember(profileId);

        await expect(reject).to.be.revertedWithCustomError(contract, "NotPendingMember");
      });
    });
  });

  describe("Project", () => {
    it("should create project", async () => {
      await waitForTx(
        contract.createProject({
          metadataURI: FAKE_METADATA_URI,
        })
      );

      const count = await contract.getProjectCount();
      const project = await contract.getProject(0);

      expect(count).to.be.eq(1);
      expect(project.metadataURI).to.be.eq(FAKE_METADATA_URI);
      expect(project.status).to.be.eq(0);
    });

    it("should update project", async () => {
      const UPDATED_METADATA_URI = "urn:dev:new:uri";
      await waitForTx(
        contract.createProject({
          metadataURI: FAKE_METADATA_URI,
        })
      );

      await waitForTx(contract.updateProject(0, { metadataURI: UPDATED_METADATA_URI, status: 1 }));

      const count = await contract.getProjectCount();
      const project = await contract.getProject(0);

      expect(count).to.be.eq(1);
      expect(project.status).to.be.eq(1);
      expect(project.metadataURI).to.be.eq(UPDATED_METADATA_URI);
    });

    it("should revert update project if not registered", async () => {
      const UPDATED_METADATA_URI = "urn:dev:new:uri";

      const tx = contract.updateProject(0, { metadataURI: UPDATED_METADATA_URI, status: 1 });

      await expect(tx).to.be.revertedWithCustomError(contract, "NotRegistered");
    });

    it("should add member", async () => {
      const PROFILE_ID = 1;
      await waitForTx(
        contract.createProject({
          metadataURI: FAKE_METADATA_URI,
        })
      );

      await waitForTx(contract.addProjectMember(0, PROFILE_ID));

      const count = await contract.getProjectMemberCount(0);
      const memberID = await contract.getProjectMember(0, 0);

      expect(count).to.be.eq(1);
      expect(memberID).to.be.eq(PROFILE_ID);
    });

    it("should revert add member if project not registered", async () => {
      const PROFILE_ID = 1;

      const tx = contract.addProjectMember(0, PROFILE_ID);

      await expect(tx).to.be.revertedWithCustomError(contract, "NotRegistered");
    });

    it("should remove member", async () => {
      const PROFILE_ID = 1;
      await waitForTx(
        contract.createProject({
          metadataURI: FAKE_METADATA_URI,
        })
      );

      await waitForTx(contract.addProjectMember(0, PROFILE_ID));

      await waitForTx(contract.removeProjectMember(0, PROFILE_ID));

      const count = await contract.getProjectMemberCount(0);

      expect(count).to.be.eq(0);
    });

    it("should revert remove member if project not registered", async () => {
      const PROFILE_ID = 1;

      const tx = contract.removeProjectMember(0, PROFILE_ID);

      await expect(tx).to.be.revertedWithCustomError(contract, "NotRegistered");
    });

    describe("Task", () => {
      const PROJECT_ID = 0;
      beforeEach(async () => {
        await waitForTx(
          contract.createProject({
            metadataURI: FAKE_METADATA_URI,
          })
        );
      });

      it("should create task", async () => {
        await waitForTx(contract.createTask(0, { metadataURI: FAKE_METADATA_URI, skills: [0, 1] }));

        const count = await contract.getTaskCount(0);
        const task = await contract["getTask(uint256)"](0);

        expect(count).to.be.eq(1);
        expect(task.id).to.be.eq(0);
        expect(task.metadataURI).to.be.eq(FAKE_METADATA_URI);
        expect(task.status).to.be.eq(0);
        expect(task.skills).to.be.deep.eq([0, 1]);
      });

      it("should update task", async () => {
        const UPDATED_METADATA_URI = "urn:dev:new:uri";
        await waitForTx(contract.createTask(0, { metadataURI: FAKE_METADATA_URI, skills: [] }));

        await waitForTx(contract.updateTask(0, { metadataURI: UPDATED_METADATA_URI, status: 1, skills: [] }));

        const task = await contract["getTask(uint256)"](0);

        expect(task.id).to.be.eq(0);
        expect(task.metadataURI).to.be.eq(UPDATED_METADATA_URI);
        expect(task.status).to.be.eq(1);
      });

      it("should update task skill list", async () => {
        const UPDATED_METADATA_URI = "urn:dev:new:uri";
        await waitForTx(contract.createTask(0, { metadataURI: FAKE_METADATA_URI, skills: [0, 1] }));

        await waitForTx(contract.updateTask(0, { metadataURI: UPDATED_METADATA_URI, status: 1, skills: [3, 2] }));

        const task = await contract["getTask(uint256)"](0);

        expect(task.id).to.be.eq(0);
        expect(task.metadataURI).to.be.eq(UPDATED_METADATA_URI);
        expect(task.status).to.be.eq(1);
        expect(task.skills).to.be.deep.eq([3, 2]);
      });

      it("should revert update if not registered", async () => {
        const UPDATED_METADATA_URI = "urn:dev:new:uri";

        const tx = contract.updateTask(0, { metadataURI: UPDATED_METADATA_URI, status: 1, skills: [3, 2] });

        await expect(tx).to.be.revertedWithCustomError(contract, "NotRegistered");
      });

      it("should add member", async () => {
        const PROFILE_ID = 1;
        await waitForTx(contract.createTask(0, { metadataURI: FAKE_METADATA_URI, skills: [] }));

        await waitForTx(contract.addTaskMember(0, PROFILE_ID));

        const count = await contract.getTaskMemberCount(0);
        const memberID = await contract.getTaskMember(0, 0);

        expect(count).to.be.eq(1);
        expect(memberID).to.be.eq(PROFILE_ID);
      });

      it("should revert add member if task not registered", async () => {
        const PROFILE_ID = 1;
        const tx = contract.addTaskMember(0, PROFILE_ID);

        await expect(tx).to.be.revertedWithCustomError(contract, "NotRegistered");
      });

      it("should remove member", async () => {
        const PROFILE_ID = 1;
        await waitForTx(contract.createTask(0, { metadataURI: FAKE_METADATA_URI, skills: [] }));

        await waitForTx(contract.addTaskMember(0, PROFILE_ID));

        await waitForTx(contract.removeTaskMember(0, PROFILE_ID));

        const count = await contract.getTaskMemberCount(0);

        expect(count).to.be.eq(0);
      });

      it("should revert remove member if task not registered", async () => {
        const PROFILE_ID = 1;
        const tx = contract.removeTaskMember(0, PROFILE_ID);

        await expect(tx).to.be.revertedWithCustomError(contract, "NotRegistered");
      });

      it("should update task time", async () => {
        const UPDATED_TIME = 100;
        const PROFILE_ID = 1;

        await waitForTx(contract.addProjectMember(PROJECT_ID, PROFILE_ID));

        await waitForTx(contract.createTask(PROJECT_ID, { metadataURI: FAKE_METADATA_URI, skills: [] }));

        const TASK_ID = 0;
        await waitForTx(contract.addTaskMember(TASK_ID, PROFILE_ID));

        const hubSigner = await impersonateContract(hub.address);
        await waitForTx(contract.connect(hubSigner).updateTaskTime(PROFILE_ID, TASK_ID, UPDATED_TIME));
        await stopImpersonatingContract(hub.address);

        const loggedTimeCount = await contract.getTaskLoggedTimeCount(TASK_ID);
        expect(loggedTimeCount).to.be.eq(1);
        for (let i = 0; i < loggedTimeCount.toNumber(); i++) {
          const taskTime = await contract.getTaskLoggedTime(TASK_ID, i);
          if (taskTime[0].toNumber() === PROFILE_ID) {
            expect(taskTime[1]).to.be.eq(UPDATED_TIME);
            return;
          }
        }
        expect.fail("Logged time entry not found");
      });

      it("should revert when profile is not project member", async () => {
        const UPDATED_TIME = 100;
        const PROFILE_ID = 1;

        await waitForTx(contract.createTask(PROJECT_ID, { metadataURI: FAKE_METADATA_URI, skills: [] }));

        const TASK_ID = 0;

        const hubSigner = await impersonateContract(hub.address);
        const txUpdate = contract.connect(hubSigner).updateTaskTime(PROFILE_ID, TASK_ID, UPDATED_TIME);

        await expect(txUpdate).to.be.revertedWithCustomError(contract, "NotMember");

        await stopImpersonatingContract(hub.address);
      });

      it("should revert when profile is not task member", async () => {
        const UPDATED_TIME = 100;
        const PROFILE_ID = 1;

        await waitForTx(contract.addProjectMember(PROJECT_ID, PROFILE_ID));
        await waitForTx(contract.createTask(PROJECT_ID, { metadataURI: FAKE_METADATA_URI, skills: [] }));

        const TASK_ID = 0;

        const hubSigner = await impersonateContract(hub.address);
        const txUpdate = contract.connect(hubSigner).updateTaskTime(PROFILE_ID, TASK_ID, UPDATED_TIME);

        await expect(txUpdate).to.be.revertedWithCustomError(contract, "NotMember");

        await stopImpersonatingContract(hub.address);
      });

      it("should revert when there is no task", async () => {
        const UPDATED_TIME = 100;
        const PROFILE_ID = 1;

        await waitForTx(contract.addProjectMember(PROJECT_ID, PROFILE_ID));
        await waitForTx(contract.createTask(PROJECT_ID, { metadataURI: FAKE_METADATA_URI, skills: [] }));

        const TASK_ID = 42;

        const txUpdate = contract.updateTaskTime(PROFILE_ID, TASK_ID, UPDATED_TIME);
        expect(txUpdate).to.be.revertedWithCustomError(contract, "NotRegistered");
      });

      it("should revert when there is no Project", async () => {
        const UPDATED_TIME = 100;
        const PROFILE_ID = 1;

        await waitForTx(contract.addProjectMember(PROJECT_ID, PROFILE_ID));

        const TASK_ID = 42;

        const txUpdate = contract.updateTaskTime(PROFILE_ID, TASK_ID, UPDATED_TIME);
        expect(txUpdate).to.be.revertedWithCustomError(contract, "NotRegistered");
      });
    });
  });
});
