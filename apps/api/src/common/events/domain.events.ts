
export class DocumentCreatedEvent {
  constructor(
    public readonly documentId: string,
    public readonly userId: string,
  ) {}
}

export class QuestionCreatedEvent {
  constructor(
    public readonly questionId: string,
    public readonly userId: string,
  ) {}
}
