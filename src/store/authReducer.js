const initialState = {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('token'),
};

export function authReducer(state = initialState, action) {
    switch (action.type) {
        case 'auth/login':
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            return {
                ...state,
                token: action.payload.token,
                user: action.payload.user,
                isAuthenticated: true,
            };
        case 'auth/logout':
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return {
                ...state,
                token: null,
                user: null,
                isAuthenticated: false,
            };
        default:
            return state;
    }
}