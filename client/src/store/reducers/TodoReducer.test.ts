import todoReducer, {TodoState} from './slices/TodoSlice';
import {todoSlice} from "./slices/TodoSlice";
import {ITodo} from "../../models/ITodo";

const mockTodo: ITodo = {
    id: 7,
    task: {
        title: "Wash the dishes",
        description: "Do it now!",
        completed: false,
        tags: ["washing", "urgent", "housework"]
    }
}

const mockTodos: ITodo[] = [
    {
        id: 1,
        task: {
            title: "Wash the dishes",
            description: "Do it now!",
            completed: false,
            tags: ["washing", "urgent", "housework"]
        }
    },
    {
        id: 2,
        task: {
            title: "Wash the dishes",
            description: "Do it now!",
            completed: true,
            tags: ["washing", "urgent", "housework"]
        }
    },
    {
        id: 3,
        task: {
            title: "Wash the dishes",
            description: "Do it now!",
            completed: false,
            tags: ["washing", "urgent", "housework"]
        }
    }
]

describe("todoReducer", () => {
    const initialState: TodoState = {
        todos: [],
        isLoading: false,
        error: '',
    };

    it('should return initial state', () => {
        expect(todoReducer(undefined, { type: '' })).toEqual(initialState);
    });

    describe('todosFetching', () => {
        it('should set isLoading to true', () => {
            const action = todoSlice.actions.todosFetching();
            const newState = todoReducer(initialState, action);

            expect(newState.isLoading).toBe(true);
        });

        it('should not affect todos array', () => {
            const stateWithTodos = {
                ...initialState,
                todos: mockTodos,
            };

            const action = todoSlice.actions.todosFetching();
            const newState = todoReducer(stateWithTodos, action);

            expect(newState.todos).toEqual(mockTodos);
            expect(newState.isLoading).toBe(true);
        });
    });

    describe('todosFetchSuccess', () => {
        it('should set todos array and set isLoading to false on todosFetchSuccess', () => {
            const loadingState = {
                ...initialState,
                isLoading: true,
                error: 'Some error',
            };

            const action = todoSlice.actions.todosFetchSuccess(mockTodos);
            const newState = todoReducer(loadingState, action);

            expect(newState.todos).toEqual(mockTodos);
            expect(newState.isLoading).toBe(false);
            expect(newState.error).toBe('');
        });

        it('should replace existing todos', () => {
            const stateWithExistingTodos = {
                ...initialState,
                todos: [
                    {
                        id: 99,
                        task: {
                            title: "Wash the dishes",
                            description: "Do it now!",
                            completed: true,
                            tags: ["washing", "urgent", "housework"]
                        }
                    }
                    ],
            };

            const action = todoSlice.actions.todosFetchSuccess(mockTodos);
            const newState = todoReducer(stateWithExistingTodos, action);

            expect(newState.todos).toEqual(mockTodos);
            expect(newState.todos).not.toContainEqual(expect.objectContaining({ id: 99 }));
        });

        it('should handle empty todos array', () => {
            const action = todoSlice.actions.todosFetchSuccess([]);
            const newState = todoReducer(initialState, action);

            expect(newState.todos).toEqual([]);
            expect(newState.isLoading).toBe(false);
        });
    });

    describe('todosFetchError', () => {
        it('should set error message and set isLoading to false on todosFetchError', () => {
            const loadingState = {
                ...initialState,
                isLoading: true,
            };

            const errorMessage = 'Failed to fetch todos';
            const action = todoSlice.actions.todosFetchError(errorMessage);
            const newState = todoReducer(loadingState, action);

            expect(newState.error).toBe(errorMessage);
            expect(newState.isLoading).toBe(false);
            expect(newState.todos).toEqual(initialState.todos);
        });

        it('should save existing todos if needed', () => {
            const stateWithTodos = {
                ...initialState,
                todos: mockTodos,
                isLoading: true,
            };

            const errorMessage = 'Network error';
            const action = todoSlice.actions.todosFetchError(errorMessage);
            const newState = todoReducer(stateWithTodos, action);

            expect(newState.error).toBe(errorMessage);
            expect(newState.isLoading).toBe(false);
            expect(newState.todos).toEqual(mockTodos);
        });
    });

    describe('taskCreateSuccess', () => {
        it('should add new todo to the end of todos array on taskCreateSuccess', () => {
            const stateWithTodos = {
                ...initialState,
                todos: [mockTodos[0], mockTodos[1]],
            };

            const newTodo = { ...mockTodo, id: 100 };
            const action = todoSlice.actions.taskCreateSuccess(newTodo);
            const newState = todoReducer(stateWithTodos, action);

            expect(newState.todos).toHaveLength(3);
            expect(newState.todos[2]).toEqual(newTodo);
            expect(newState.error).toBe('');
        });

        it('should add todo to empty array', () => {
            const action = todoSlice.actions.taskCreateSuccess(mockTodo);
            const newState = todoReducer(initialState, action);

            expect(newState.todos).toHaveLength(1);
            expect(newState.todos[0]).toEqual(mockTodo);
            expect(newState.error).toBe('');
        });

        it('should clear existing error', () => {
            const stateWithError = {
                ...initialState,
                error: 'Previous error',
            };

            const action = todoSlice.actions.taskCreateSuccess(mockTodo);
            const newState = todoReducer(stateWithError, action);

            expect(newState.error).toBe('');
            expect(newState.todos[0]).toEqual(mockTodo);
        });
    });

    describe('taskCreateError', () => {
        it('should set error message on taskCreateError', () => {
            const stateWithTodos = {
                ...initialState,
                todos: mockTodos,
            };

            const errorMessage = 'Failed to create task';
            const action = todoSlice.actions.taskCreateError(errorMessage);
            const newState = todoReducer(stateWithTodos, action);

            expect(newState.error).toBe(errorMessage);
            expect(newState.todos).toEqual(mockTodos);
        });

        it('should overwrite existing error', () => {
            const stateWithError = {
                ...initialState,
                error: 'Old error',
            };

            const newErrorMessage = 'New create error';
            const action = todoSlice.actions.taskCreateError(newErrorMessage);
            const newState = todoReducer(stateWithError, action);

            expect(newState.error).toBe(newErrorMessage);
        });
    });

    describe('taskUpdateSuccess', () => {
        it('should update existing todo on taskUpdateSuccess', () => {
            const stateWithTodos = {
                ...initialState,
                todos: mockTodos,
            };

            const updatedTodo = {
                ...mockTodos[1],
                task: {
                    ...mockTodos[1].task,
                    title: 'Updated Title',
                    completed: false,
                }
            };

            const action = todoSlice.actions.taskUpdateSuccess(updatedTodo);
            const newState = todoReducer(stateWithTodos, action);

            expect(newState.todos).toHaveLength(3);
            expect(newState.todos[1]).toEqual(updatedTodo);
            expect(newState.todos[0]).toEqual(mockTodos[0]);
            expect(newState.todos[2]).toEqual(mockTodos[2]);
            expect(newState.error).toBe('');
        });

        it('should handle updating todo that does not exist (no change)', () => {
            const stateWithTodos = {
                ...initialState,
                todos: mockTodos,
            };

            const nonExistingTodo = {
                ...mockTodo,
                id: 999,
            };

            const action = todoSlice.actions.taskUpdateSuccess(nonExistingTodo);
            const newState = todoReducer(stateWithTodos, action);

            expect(newState.todos).toEqual(mockTodos);
            expect(newState.error).toBe('');
        });

        it('should clear error when update is successful', () => {
            const stateWithError = {
                ...initialState,
                todos: mockTodos,
                error: 'Previous error',
            };

            const updatedTodo = { ...mockTodos[0], task: {...mockTodos[0].task, title: 'Updated title'} };
            const action = todoSlice.actions.taskUpdateSuccess(updatedTodo);
            const newState = todoReducer(stateWithError, action);

            expect(newState.error).toBe('');
            expect(newState.todos[0].task.title).toBe('Updated title');
        });

        it('should handle multiple properties update', () => {
            const todoToUpdate = mockTodos[0];
            const updatedTodo = {
                ...todoToUpdate,
                task: {
                    ...todoToUpdate.task,
                    title: 'Completely New Title',
                    description: 'New Description',
                    completed: true,
                }
            };

            const stateWithTodos = {
                ...initialState,
                todos: [todoToUpdate],
            };

            const action = todoSlice.actions.taskUpdateSuccess(updatedTodo);
            const newState = todoReducer(stateWithTodos, action);

            expect(newState.todos[0].task.title).toBe('Completely New Title');
            expect(newState.todos[0].task.description).toBe('New Description');
            expect(newState.todos[0].task.completed).toBe(true);
        });
    });

    describe('taskUpdateError', () => {
        it('should set error message on taskUpdateError', () => {
            const stateWithTodos = {
                ...initialState,
                todos: mockTodos,
            };

            const errorMessage = 'Failed to update task';
            const action = todoSlice.actions.taskUpdateError(errorMessage);
            const newState = todoReducer(stateWithTodos, action);

            expect(newState.error).toBe(errorMessage);
            expect(newState.todos).toEqual(mockTodos);
        });
    });

    describe('taskDeleteSuccess', () => {
        it('should remove todo by id on taskDeleteSuccess', () => {
            const stateWithTodos = {
                ...initialState,
                todos: mockTodos,
            };

            const todoIdToDelete = mockTodos[1].id;
            const action = todoSlice.actions.taskDeleteSuccess(todoIdToDelete);
            const newState = todoReducer(stateWithTodos, action);

            expect(newState.todos).toHaveLength(2);
            expect(newState.todos).not.toContainEqual(expect.objectContaining({ id: todoIdToDelete }));
            expect(newState.todos[0].id).toBe(mockTodos[0].id);
            expect(newState.todos[1].id).toBe(mockTodos[2].id);
            expect(newState.error).toBe('');
        });

        it('should handle deleting non-existing id (no change)', () => {
            const stateWithTodos = {
                ...initialState,
                todos: mockTodos,
            };

            const nonExistingId = 999;
            const action = todoSlice.actions.taskDeleteSuccess(nonExistingId);
            const newState = todoReducer(stateWithTodos, action);

            expect(newState.todos).toEqual(mockTodos);
            expect(newState.error).toBe('');
        });

        it('should clear error when delete is successful', () => {
            const stateWithError = {
                ...initialState,
                todos: mockTodos,
                error: 'Previous error',
            };

            const action = todoSlice.actions.taskDeleteSuccess(mockTodos[0].id);
            const newState = todoReducer(stateWithError, action);

            expect(newState.error).toBe('');
            expect(newState.todos).toHaveLength(2);
        });

        it('should handle deleting from empty array', () => {
            const action = todoSlice.actions.taskDeleteSuccess(1);
            const newState = todoReducer(initialState, action);

            expect(newState.todos).toEqual([]);
            expect(newState.error).toBe('');
        });
    });

    describe('taskDeleteError', () => {
        it('should set error message on taskDeleteError', () => {
            const stateWithTodos = {
                ...initialState,
                todos: mockTodos,
            };

            const errorMessage = 'Failed to delete task';
            const action = todoSlice.actions.taskDeleteError(errorMessage);
            const newState = todoReducer(stateWithTodos, action);

            expect(newState.error).toBe(errorMessage);
            expect(newState.todos).toEqual(mockTodos);
        });

        it('should preserve existing todos when delete fails', () => {
            const action = todoSlice.actions.taskDeleteError('Delete failed');
            const newState = todoReducer(initialState, action);

            expect(newState.error).toBe('Delete failed');
            expect(newState.todos).toEqual([]);
        });
    });

    describe('sequential actions', () => {
        it('should handle complete todo lifecycle', () => {
            let state = todoReducer(undefined, { type: '' });
            expect(state).toEqual(initialState);

            state = todoReducer(state, todoSlice.actions.todosFetching());
            expect(state.isLoading).toBe(true);

            state = todoReducer(state, todoSlice.actions.todosFetchSuccess(mockTodos));
            expect(state.todos).toEqual(mockTodos);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe('');

            const newTodo = { ...mockTodo, id: 100 };
            state = todoReducer(state, todoSlice.actions.taskCreateSuccess(newTodo));
            expect(state.todos).toHaveLength(4);
            expect(state.todos[3].id).toBe(100);

            const updatedTodo = { ...mockTodos[0], task: {...mockTodos[0].task, title: 'Updated title'} };
            state = todoReducer(state, todoSlice.actions.taskUpdateSuccess(updatedTodo));
            expect(state.todos[0].task.title).toBe('Updated title');

            state = todoReducer(state, todoSlice.actions.taskDeleteSuccess(mockTodos[1].id));
            expect(state.todos).toHaveLength(3);

            state = todoReducer(state, todoSlice.actions.taskUpdateError('Update failed'));
            expect(state.error).toBe('Update failed');
        });

        it('should handle error recovery scenario', () => {
            let state = todoReducer(undefined, { type: '' });

            state = todoReducer(state, todoSlice.actions.taskCreateError('Creation failed'));
            expect(state.error).toBe('Creation failed');

            state = todoReducer(state, todoSlice.actions.taskCreateSuccess(mockTodo));
            expect(state.error).toBe('');
            expect(state.todos).toHaveLength(1);
        });
    });
})
