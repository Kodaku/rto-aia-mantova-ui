export type User = {
    name: string;
    surname: string;
    mechanographicCode: string;
};

export type UserInitialState = {
    users: User[];
    currentUser: User;
};

export type RTO = {
    date: string;
    description: string;
    users: User[];
    qrcode: string;
};

export type RTOInitialState = {
    currentRTO: RTO;
    rtos: RTO[];
};
