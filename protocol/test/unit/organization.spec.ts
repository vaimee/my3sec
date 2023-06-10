import { ethers } from "hardhat";
import { expect } from "chai";

import { Organization } from "../../typechain-types";
import { getRandomProfileId, waitForTx } from "../helpers/utils";

const FAKE_METADATA_URI = "urn:dev:fake";

describe("Organization", () => {
  let contract: Organization;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    const deployerAddress = deployer.address;

    const contractFactory = await ethers.getContractFactory("Organization");
    contract = await contractFactory.deploy(deployerAddress, FAKE_METADATA_URI);
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

      await contract.join(profileId);

      const pendingMemberCount = await contract.getPendingMemberCount();
      const isMember = await contract.isMember(profileId);
      expect(pendingMemberCount).to.be.equal(1);
      expect(isMember).to.be.false;
    });

    it("should not add twice a profile if is pending", async () => {
      const profileId = getRandomProfileId();

      await contract.join(profileId);
      await contract.join(profileId);

      const pendingMemberCount = await contract.getPendingMemberCount();
      const isMember = await contract.isMember(profileId);
      expect(pendingMemberCount).to.be.equal(1);
      expect(isMember).to.be.false;
    });

    describe("approvePendingMember", () => {
      it("should approve joined member", async () => {
        const profileId = getRandomProfileId();

        await contract.join(profileId);

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

        await contract.join(profileId);
        await contract.approvePendingMember(profileId);

        const pendingMembers = contract.approvePendingMember(profileId);
        await expect(pendingMembers).to.be.revertedWithCustomError(contract, "NotPendingMember");
      });

      describe("leave", () => {
        it("should let a member leave", async () => {
          const profileId = getRandomProfileId();

          await contract.join(profileId);
          await contract.approvePendingMember(profileId);

          await contract.leave(profileId);

          const memberCount = await contract.getMemberCount();
          const isMember = await contract.isMember(profileId);
          expect(memberCount).to.be.equal(0);
          expect(isMember).to.be.false;
        });

        it("should let a member leave also if his only pending", async () => {
          const profileId = getRandomProfileId();

          await contract.join(profileId);

          await contract.leave(profileId);

          const pendingMemberCount = await contract.getPendingMemberCount();
          const isMember = await contract.isMember(profileId);
          expect(pendingMemberCount).to.be.equal(0);
          expect(isMember).to.be.false;
        });

        it("should revert if not a member", async () => {
          const profileId = getRandomProfileId();

          const leave = contract.leave(profileId);
          await expect(leave).to.be.revertedWithCustomError(contract, "NotMember");
        });
      });
    });

    describe("rejectPendingMember", () => {
      it("should reject pending member", async () => {
        const profileId = getRandomProfileId();

        await contract.join(profileId);

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
      expect(project.status).to.be.eq(1);
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

      expect(tx).to.be.revertedWithCustomError(contract, "NotRegistered");
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

      expect(tx).to.be.revertedWithCustomError(contract, "NotRegistered");
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

      expect(tx).to.be.revertedWithCustomError(contract, "NotRegistered");
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
        expect(task.status).to.be.eq(1);
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

        expect(tx).to.be.revertedWithCustomError(contract, "NotRegistered");
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

        expect(tx).to.be.revertedWithCustomError(contract, "NotRegistered");
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

        expect(tx).to.be.revertedWithCustomError(contract, "NotRegistered");
      });

      it("should update task time", async () => {
        const UPDATED_TIME = 100;
        const PROFILE_ID = 1;

        await waitForTx(contract.addProjectMember(PROJECT_ID, PROFILE_ID));

        await waitForTx(contract.createTask(PROJECT_ID, { metadataURI: FAKE_METADATA_URI, skills: [] }));

        const TASK_ID = 0;
        await waitForTx(contract.addTaskMember(TASK_ID, PROFILE_ID));

        await waitForTx(contract.updateTaskTime(PROFILE_ID, TASK_ID, UPDATED_TIME));

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

        const txUpdate = contract.updateTaskTime(PROFILE_ID, TASK_ID, UPDATED_TIME);
        expect(txUpdate).to.be.revertedWithCustomError(contract, "NotMember");
      });

      it("should revert when profile is not task member", async () => {
        const UPDATED_TIME = 100;
        const PROFILE_ID = 1;

        await waitForTx(contract.addProjectMember(PROJECT_ID, PROFILE_ID));
        await waitForTx(contract.createTask(PROJECT_ID, { metadataURI: FAKE_METADATA_URI, skills: [] }));

        const TASK_ID = 0;

        const txUpdate = contract.updateTaskTime(PROFILE_ID, TASK_ID, UPDATED_TIME);
        expect(txUpdate).to.be.revertedWithCustomError(contract, "NotMember");
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
