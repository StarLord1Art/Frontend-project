export interface ITodo {
    id: number,
    task: {
        title: string,
        description: string,
        completed: boolean,
        tags: string[],
    }
}