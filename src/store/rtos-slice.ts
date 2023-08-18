import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RTO, RTOInitialState } from "../types";

const initialState: RTOInitialState = {
    rtos: [],
    currentRTO: {
        dataRTO: "",
        descrizione: "",
        codiciCategoria: [],
        categorieEstese: [],
        qrcode: "",
    },
};

const rtosSlice = createSlice({
    name: "rtos",
    initialState: initialState,
    reducers: {
        replaceRTOs(state, action: PayloadAction<{ rtos: RTO[] }>) {
            const rtos = action.payload.rtos;
            if (rtos) {
                state.rtos = rtos;
            }
        },
        updateRTO(state, action: PayloadAction<{ rto: RTO }>) {
            const newRTO = action.payload.rto;
            const oldRTOIndex = state.rtos.findIndex(
                (rto) => rto.dataRTO === newRTO.dataRTO
            );
            state.rtos[oldRTOIndex] = newRTO;
            console.log("New RTO: ", state.rtos[oldRTOIndex]);
        },
        getRTO(state, action: PayloadAction<{ date: string }>) {
            const date = action.payload.date;
            const user = state.rtos.find((rto) => rto.dataRTO === date);
            if (user) {
                state.currentRTO = user;
            }
        },
    },
});

const rtosActions = rtosSlice.actions;

export { rtosActions, rtosSlice };
