import { AnyAction, ThunkAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from ".";
import { HOST } from "../constants";
import { RTORetrievedJustification, User } from "../types";
import { justificationsActions } from "./justifications-slice";
import { rtosActions } from "./rtos-slice";

export const fetchUserJustifications = (
    token: string,
    mechanographicCode: string
): ThunkAction<void, RootState, unknown, AnyAction> => {
    return async (dispatch) => {
        const fetchData = async () => {
            const response = await axios.get(
                HOST + `/rtos/justifications/${mechanographicCode}`,
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                }
            );

            const data = await response.data;
            return data as RTORetrievedJustification[];
        };

        const usersJustifications = await fetchData();
        dispatch(
            justificationsActions.replaceJustifications({
                justifications: usersJustifications || [],
            })
        );
    };
};

export const addUserToRTO = (
    rtoDate: string,
    user: User,
    token: string
): ThunkAction<void, RootState, unknown, AnyAction> => {
    return async (dispatch) => {
        const addUser = async () => {
            const response = await axios.post(
                HOST + `/rtos/users/${rtoDate}`,
                {
                    nome: user.nome,
                    cognome: user.cognome,
                    codiceMeccanografico: user.codiceMeccanografico.toString(),
                    qualifica: user.qualifica,
                    email: user.email,
                    categoriaEstesa: user.categoriaEstesa,
                    codiceCategoria: user.codiceCategoria,
                    selezionabile: user.selezionabile,
                },
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                }
            );
            const data = await response.data;
            console.log(data);
            return data as RTORetrievedJustification;
        };
        const justificationResp = await addUser();
        dispatch(
            justificationsActions.addUserToRTO({
                justification: justificationResp,
            })
        );
        dispatch(rtosActions.getRTO({ date: justificationResp.dataRTO }));
    };
};
