import modalReducer, {ModalState} from './slices/ModalSlice';
import {modalSlice} from './slices/ModalSlice';

describe('modalReducer', () => {
    const initialState: ModalState = {
        isOpen: false,
        isModalLoading: false,
        title: '',
        description: '',
    };

    it('should return initial state', () => {
        expect(modalReducer(undefined, { type: '' })).toEqual(initialState);
    });

    describe('closeModal', () => {
        it('should close modal and reset title and description', () => {
            const stateWithOpenModal = {
                isOpen: true,
                isModalLoading: false,
                title: 'Test Title',
                description: 'Test Description',
            };

            const action = modalSlice.actions.closeModal();
            const newState = modalReducer(stateWithOpenModal, action);

            expect(newState.isOpen).toBe(false);
            expect(newState.title).toBe('');
            expect(newState.description).toBe('');
        });

        it('should handle closing already closed modal', () => {
            const action = modalSlice.actions.closeModal();
            const newState = modalReducer(initialState, action);

            expect(newState.isOpen).toBe(false);
            expect(newState.title).toBe('');
            expect(newState.description).toBe('');
        });

        it('should reset fields even when modal has empty strings', () => {
            const stateWithEmptyStrings = {
                isOpen: true,
                isModalLoading: false,
                title: '',
                description: '',
            };

            const action = modalSlice.actions.closeModal();
            const newState = modalReducer(stateWithEmptyStrings, action);

            expect(newState.isOpen).toBe(false);
            expect(newState.title).toBe('');
            expect(newState.description).toBe('');
        });
    });

    describe('openModal', () => {
        it('should open modal', () => {
            const action = modalSlice.actions.openModal();
            const newState = modalReducer(initialState, action);

            expect(newState.isOpen).toBe(true);
            expect(newState.title).toBe('');
            expect(newState.description).toBe('');
        });

        it('should open already opened modal (idempotent)', () => {
            const stateWithOpenModal = {
                isOpen: true,
                isModalLoading: false,
                title: 'Existing Title',
                description: 'Existing Description',
            };

            const action = modalSlice.actions.openModal();
            const newState = modalReducer(stateWithOpenModal, action);

            expect(newState.isOpen).toBe(true);
            expect(newState.title).toBe('Existing Title');
            expect(newState.description).toBe('Existing Description');
        });
    });

    describe('changeTitle', () => {
        it('should change title', () => {
            const newTitle = 'New Title';
            const action = modalSlice.actions.changeTitle(newTitle);
            const newState = modalReducer(initialState, action);

            expect(newState.title).toBe(newTitle);
            expect(newState.description).toBe('');
        });

        it('should change title when modal is open', () => {
            const stateWithOpenModal = {
                isOpen: true,
                isModalLoading: false,
                title: 'Old Title',
                description: 'Description',
            };

            const newTitle = 'Updated Title';
            const action = modalSlice.actions.changeTitle(newTitle);
            const newState = modalReducer(stateWithOpenModal, action);

            expect(newState.title).toBe(newTitle);
            expect(newState.isOpen).toBe(true);
        });

        it('should handle empty title', () => {
            const action = modalSlice.actions.changeTitle('');
            const newState = modalReducer(initialState, action);

            expect(newState.title).toBe('');
        });

        it('should handle title with emoji', () => {
            const titleWithEmoji = 'Title with spaces 😀';
            const action = modalSlice.actions.changeTitle(titleWithEmoji);
            const newState = modalReducer(initialState, action);

            expect(newState.title).toBe(titleWithEmoji);
        });

        it('should overwrite existing title', () => {
            const stateWithTitle = {
                ...initialState,
                title: 'Old Title',
            };

            const newTitle = 'Completely New Title';
            const action = modalSlice.actions.changeTitle(newTitle);
            const newState = modalReducer(stateWithTitle, action);

            expect(newState.title).toBe(newTitle);
        });

        it('should handle long title', () => {
            const longTitle = 'A'.repeat(1000);
            const action = modalSlice.actions.changeTitle(longTitle);
            const newState = modalReducer(initialState, action);

            expect(newState.title).toBe(longTitle);
            expect(newState.title.length).toBe(1000);
        });
    });

    describe('changeDescription', () => {
        it('should change description', () => {
            const newDescription = 'New Modal Description';
            const action = modalSlice.actions.changeDescription(newDescription);
            const newState = modalReducer(initialState, action);

            expect(newState.description).toBe(newDescription);
            expect(newState.title).toBe('');
        });

        it('should change description when modal is open', () => {
            const stateWithOpenModal = {
                isOpen: true,
                isModalLoading: false,
                title: 'Title',
                description: 'Old Description',
            };

            const newDescription = 'Updated Description';
            const action = modalSlice.actions.changeDescription(newDescription);
            const newState = modalReducer(stateWithOpenModal, action);

            expect(newState.description).toBe(newDescription);
            expect(newState.isOpen).toBe(true);
        });

        it('should handle empty description', () => {
            const action = modalSlice.actions.changeDescription('');
            const newState = modalReducer(initialState, action);

            expect(newState.description).toBe('');
        });

        it('should handle multiline description', () => {
            const multilineDescription = 'Line 1\nLine 2\nLine 3';
            const action = modalSlice.actions.changeDescription(multilineDescription);
            const newState = modalReducer(initialState, action);

            expect(newState.description).toBe(multilineDescription);
        });

        it('should overwrite existing description', () => {
            const stateWithDescription = {
                ...initialState,
                description: 'Old Description',
            };

            const newDescription = 'Completely New Description';
            const action = modalSlice.actions.changeDescription(newDescription);
            const newState = modalReducer(stateWithDescription, action);

            expect(newState.description).toBe(newDescription);
        });

        it('should handle long description', () => {
            const longDescription = 'B'.repeat(5000);
            const action = modalSlice.actions.changeDescription(longDescription);
            const newState = modalReducer(initialState, action);

            expect(newState.description).toBe(longDescription);
            expect(newState.description.length).toBe(5000);
        });
    });

    describe('changeIsModalLoading', () => {
        it('should not change loading state to true when modal is not open', () => {
            const action = modalSlice.actions.changeIsModalLoading(true);
            const newState = modalReducer(initialState, action);

            expect(newState.isModalLoading).toBe(false);
        });

        it('should change loading state to false when modal is open', () => {
            const stateWithLoading = {
                isOpen: true,
                isModalLoading: true,
                title: 'Title',
                description: 'Description',
            };

            const action = modalSlice.actions.changeIsModalLoading(false);
            const newState = modalReducer(stateWithLoading, action);

            expect(newState.isModalLoading).toBe(false);
        });

        it('should change loading state to true when modal is open', () => {
            const stateWithOpenModal = {
                isOpen: true,
                isModalLoading: false,
                title: 'Title',
                description: 'Description',
            };

            const action = modalSlice.actions.changeIsModalLoading(true);
            const newState = modalReducer(stateWithOpenModal, action);

            expect(newState.isModalLoading).toBe(true);
            expect(newState.isOpen).toBe(true);
        });

        it('should handle setting loading to same value (idempotent)', () => {
            const action = modalSlice.actions.changeIsModalLoading(false);
            const newState = modalReducer(initialState, action);

            expect(newState.isModalLoading).toBe(false);
        });
    });

    describe('sequential actions', () => {
        it('should handle complete modal flow', () => {
            let state = modalReducer(undefined, { type: '' });
            expect(state).toEqual(initialState);

            state = modalReducer(state, modalSlice.actions.openModal());
            expect(state.isOpen).toBe(true);

            state = modalReducer(state, modalSlice.actions.changeTitle('New Task'));
            expect(state.title).toBe('New Task');

            state = modalReducer(state, modalSlice.actions.changeDescription('Task description'));
            expect(state.description).toBe('Task description');

            state = modalReducer(state, modalSlice.actions.changeIsModalLoading(true));
            expect(state.isModalLoading).toBe(true);

            state = modalReducer(state, modalSlice.actions.changeIsModalLoading(false));
            expect(state.isModalLoading).toBe(false);

            state = modalReducer(state, modalSlice.actions.closeModal());
            expect(state.isOpen).toBe(false);
            expect(state.title).toBe('');
            expect(state.description).toBe('');
            expect(state.isModalLoading).toBe(false);
        });

        it('should handle open → edit → close → open sequence', () => {
            let state = modalReducer(undefined, { type: '' });

            state = modalReducer(state, modalSlice.actions.openModal());
            state = modalReducer(state, modalSlice.actions.changeTitle('First Title'));
            state = modalReducer(state, modalSlice.actions.changeDescription('First Desc'));

            expect(state.isOpen).toBe(true);
            expect(state.title).toBe('First Title');
            expect(state.description).toBe('First Desc');

            state = modalReducer(state, modalSlice.actions.closeModal());

            expect(state.isOpen).toBe(false);
            expect(state.title).toBe('');
            expect(state.description).toBe('');

            state = modalReducer(state, modalSlice.actions.openModal());
            state = modalReducer(state, modalSlice.actions.changeTitle('Second Title'));
            state = modalReducer(state, modalSlice.actions.changeDescription('Second Desc'));

            expect(state.isOpen).toBe(true);
            expect(state.title).toBe('Second Title');
            expect(state.description).toBe('Second Desc');
        });

        it('should handle loading states during modal operations', () => {
            let state = modalReducer(undefined, { type: '' });

            state = modalReducer(state, modalSlice.actions.openModal());
            expect(state.isOpen).toBe(true);
            expect(state.isModalLoading).toBe(false);

            state = modalReducer(state, modalSlice.actions.changeTitle('Title'));
            state = modalReducer(state, modalSlice.actions.changeDescription('Description'));
            state = modalReducer(state, modalSlice.actions.changeIsModalLoading(true));

            expect(state.isModalLoading).toBe(true);
            expect(state.title).toBe('Title');
            expect(state.description).toBe('Description');

            state = modalReducer(state, modalSlice.actions.changeIsModalLoading(false));
            state = modalReducer(state, modalSlice.actions.closeModal());

            expect(state.isModalLoading).toBe(false);
            expect(state.isOpen).toBe(false);
        });
    });
})
