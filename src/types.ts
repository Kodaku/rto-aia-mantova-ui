export type User = {
    nome: string;
    cognome: string;
    codiceMeccanografico: string;
    qualifica: string;
    codiceCategoria: string;
    categoriaEstesa: string;
    email: string;
    selezionabile: boolean;
};

export type UserInitialState = {
    users: User[];
    currentUser: User;
};

export type RTO = {
    dataRTO: string;
    descrizione: string;
    codiciCategoria: string[];
    categorieEstese: string[];
    qrcode: string;
};

export type RTOInitialState = {
    currentRTO: RTO;
    rtos: RTO[];
};

export type RTORetrievedJustification = {
    dataRTO: string;
    statoUtente: string;
    descrizioneGiustifica: string;
    motivo: string;
};

export type JustificationsInitialState = {
    justifications: RTORetrievedJustification[];
};
