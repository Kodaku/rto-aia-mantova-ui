import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import Header from "../UI/Header";
import { fetchRTOs, getRTO } from "../../store/rtosActions";
import { fetchUsers, getUser } from "../../store/usersActions";
import { Link } from "react-router-dom";
import {
    addUserToRTO,
    fetchUserJustifications,
} from "../../store/justificationsActions";

const RTOHome = () => {
    const dispatch = useAppDispatch();
    const [currentDay, setCurrentDay] = useState<string>("");
    const rtos = useAppSelector((state) => state.rtos.rtos);
    const currentUser = useAppSelector((state) => state.users.currentUser);
    const justifications = useAppSelector(
        (state) => state.justifications.justifications
    );
    const [hasConfirmedPresence, setHasConfirmedPresence] = useState(false);
    const [hasDoubledConfirmedPresence, setHasDoubledConfirmedPresence] =
        useState(false);

    const getDate = (dateString: string) => {
        const [datePart, timePart] = dateString.split("T");
        const [year, month, day] = datePart.split("-");
        const [hour, minute, second] = timePart.split(":");
        const formattedDateString = `${month}-${day}-${year} ${hour}:${minute}:${second}`;
        return new Date(formattedDateString);
    };

    const checkDateBetween = (startDate: Date, date: Date, endDate: Date) => {
        const targetTime = date.getTime();
        const startTime = startDate.getTime();
        const endTime = endDate.getTime();

        return targetTime >= startTime && targetTime <= endTime;
    };

    const getCurrentRTO = () => {
        if (currentDay.length > 0) {
            const currentRTO = rtos.filter((rto) => {
                const rtoDate = getDate(rto.dataRTO);
                let lastChanceDate = new Date(rtoDate);
                lastChanceDate.setHours(lastChanceDate.getHours() + 2);
                const today = getDate(currentDay);
                if (checkDateBetween(rtoDate, today, lastChanceDate)) {
                    return true;
                }
                return false;
            });
            if (currentRTO[0]) {
                const categorieEstese = currentRTO[0].categorieEstese.map(
                    (categoria) => categoria.replaceAll(" ", "")
                );
                console.log(currentRTO);
                // Check if the RTO is for the user
                if (
                    currentRTO[0].codiciCategoria.includes(
                        currentUser.codiceCategoria
                    ) &&
                    categorieEstese.includes(currentUser.categoriaEstesa)
                ) {
                    return currentRTO[0];
                }
            }
            return null;
        }
        return null;
    };

    const currentRTO = getCurrentRTO();

    const checkIfUserIsInRTO = () => {
        let found = false;
        if (currentRTO !== null && currentRTO !== undefined) {
            justifications.forEach((justification) => {
                if (
                    justification.dataRTO === currentRTO.dataRTO &&
                    justification.statoUtente === "PRESENTE"
                ) {
                    found = true;
                }
            });
        }
        return found;
    };

    useEffect(() => {
        if (
            localStorage.getItem("token") !== null &&
            localStorage.getItem("code") !== null
        ) {
            dispatch(fetchUsers());
            dispatch(getUser(localStorage.getItem("code")!));
            dispatch(fetchRTOs(localStorage.getItem("token")!));
            dispatch(
                fetchUserJustifications(
                    localStorage.getItem("token")!,
                    localStorage.getItem("code")!
                )
            );
            const today = new Date();
            const month = (today.getMonth() + 1).toString();
            const hour = today.getHours().toString();
            const minute = today.getMinutes().toString();
            const day =
                today.getFullYear().toString() +
                "-" +
                month.padStart(2, "0") +
                "-" +
                today.getDate().toString().padStart(2, "0") +
                "T" +
                hour.padStart(2, "0") +
                ":" +
                minute.padStart(2, "0") +
                ":00";
            setCurrentDay(day);
            dispatch(getRTO(day, localStorage.getItem("token")!));
        }
    }, [dispatch]);

    return (
        <>
            <Header />
            {currentRTO !== null && currentRTO && (
                <div className="container" style={{ textAlign: "center" }}>
                    <br />
                    <div className="card-wrapper">
                        <div className="card">
                            <div className="card-body">
                                <h3 className="card-title h3">
                                    Benvenuto alla RTO del{" "}
                                    {getDate(
                                        currentRTO.dataRTO
                                    ).toLocaleDateString()}{" "}
                                    ore{" "}
                                    {getDate(currentRTO.dataRTO)
                                        .getHours()
                                        .toString()
                                        .padStart(2, "0")}
                                    :
                                    {getDate(currentRTO.dataRTO)
                                        .getMinutes()
                                        .toString()
                                        .padStart(2, "0")}
                                    :00
                                </h3>
                                <br />
                                <h4>{currentRTO.descrizione}</h4>
                                <br />
                                {!hasConfirmedPresence &&
                                    !checkIfUserIsInRTO() && (
                                        <>
                                            <h5 className="h3">
                                                Conferma la tua presenza
                                            </h5>
                                            <br />
                                            <div className="row">
                                                <div className="form-group col text-center">
                                                    <button
                                                        id="buttonSubmitChiaveVerbale"
                                                        className="btn btn-primary"
                                                        onClick={() => {
                                                            dispatch(
                                                                addUserToRTO(
                                                                    currentRTO.dataRTO,
                                                                    currentUser,
                                                                    localStorage.getItem(
                                                                        "token"
                                                                    )!
                                                                )
                                                            );
                                                            if (
                                                                !hasConfirmedPresence
                                                            ) {
                                                                setHasConfirmedPresence(
                                                                    true
                                                                );
                                                            }
                                                            if (
                                                                hasConfirmedPresence &&
                                                                !hasDoubledConfirmedPresence
                                                            ) {
                                                                setHasDoubledConfirmedPresence(
                                                                    true
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        Presente
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                {hasConfirmedPresence &&
                                    !hasDoubledConfirmedPresence &&
                                    !checkIfUserIsInRTO && (
                                        <div className="row">
                                            <h3
                                                className="h3"
                                                style={{ color: "green" }}
                                            >
                                                La tua presenza è stata
                                                registrata con successo!
                                            </h3>
                                        </div>
                                    )}
                                {((hasConfirmedPresence &&
                                    hasDoubledConfirmedPresence) ||
                                    checkIfUserIsInRTO()) && (
                                    <div className="row">
                                        <h3
                                            className="h3"
                                            style={{ color: "green" }}
                                        >
                                            La tua presenza è stata registrata.
                                        </h3>
                                        <h3 style={{ color: "green" }}>
                                            Goditi la RTO!
                                        </h3>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {(currentRTO === null || currentRTO === undefined) && (
                <div className="container" style={{ textAlign: "center" }}>
                    <br />
                    <div className="card-wrapper">
                        <div className="card">
                            <div className="card-body">
                                <h3 className="card-title h3">
                                    Al momento non ci sono RTO di cui confermare
                                    la presenza!
                                </h3>
                                <h3>
                                    Clicca{" "}
                                    <Link
                                        to="/"
                                        onClick={() => {
                                            localStorage.removeItem("code");
                                            localStorage.removeItem("token");
                                        }}
                                    >
                                        qui
                                    </Link>{" "}
                                    per tornare alla home
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RTOHome;
