import { Observable } from 'rxjs';

import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Task } from '@shared/interfaces/project.interface';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent {
  @Input() tasks$!: Observable<Task[]>;

  constructor(private router: Router, private route: ActivatedRoute) {}

  goTo(id: number): void {
    this.router.navigate([`tasks/${id}`], { relativeTo: this.route });
  }

  public removeMarkdownSyntax(text: string): string {
    // Remove headers (e.g., ## Header)
    text = text.replace(/#+\s+(.*?)\s+#+/g, '$1');

    // Remove emphasis (e.g., *italic* or _italic_)
    text = text.replace(/(\*|_)(.*?)\1/g, '$2');

    // Remove bold (e.g., **bold** or __bold__)
    text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');

    // Remove code blocks (e.g., ```code```)
    text = text.replace(/```([\s\S]*?)```/g, '$1');

    // Remove inline code (e.g., `code`)
    text = text.replace(/`([^`]+)`/g, '$1');

    // Remove unordered lists (e.g., - List item)
    text = text.replace(/^- (.*)/gm, '$1');

    // Remove ordered lists (e.g., 1. List item)
    text = text.replace(/^\d+\.\s+(.*)/gm, '$1');

    // Remove blockquotes (e.g., > Quote)
    text = text.replace(/^> (.*)/gm, '$1');

    // Remove horizontal rules (e.g., ---)
    text = text.replace(/^---+$/gm, '');

    // Remove links (e.g., [link](url))
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');

    // Remove images (e.g., ![alt text](url))
    text = text.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '');

    return text.trim();
  }
}
