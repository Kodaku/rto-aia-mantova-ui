import { SetStateAction, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import Header from "../UI/Header";
import { fetchUsers, getUser } from "../../store/usersActions";
import { fetchRTOs, getRTO } from "../../store/rtosActions";
import { Link, useNavigate } from "react-router-dom";
// import { Html5QrcodeScanner } from "html5-qrcode";
import { QrReader } from "react-qr-reader";
import { Result } from "@zxing/library";

const QRCodeScanner = () => {
    const rtos = useAppSelector((state) => state.rtos.rtos);
    const dispatch = useAppDispatch();
    const [currentDay, setCurrentDay] = useState<string>("");
    const [selected, setSelected] = useState("user");
    const [startScan, setStartScan] = useState(false);
    const [loadingScan, setLoadingScan] = useState(false);
    const [validQr, setValidQr] = useState(false);
    const [hasScanned, setHasScanned] = useState(false);
    const navigate = useNavigate();

    const handleScan = async (scanData: SetStateAction<string> | Result) => {
        setLoadingScan(true);
        // console.log(`loaded data data`, scanData);
        if (scanData && scanData !== "" && startScan && !hasScanned) {
            setHasScanned(true);
            const currentRTO = getCurrentRTO();
            if (
                currentRTO !== null &&
                scanData.toString() === currentRTO.qrcode.toString()
            ) {
                console.log("VALID SCAN!");
                setValidQr(true);
                navigate("/rto");
            }
            setStartScan(false);
            setLoadingScan(false);
            // setPrecScan(scanData);
        }
    };
    const handleError = (err: Error) => {};

    const getDate = (dateString: string) => {
        const [datePart, timePart] = dateString.split("T");
        const [day, month, year] = datePart.split("-");
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
                const rtoDate = getDate(rto.date);
                let lastChanceDate = new Date(rtoDate);
                lastChanceDate.setHours(lastChanceDate.getHours() + 2);
                const today = getDate(currentDay);
                if (checkDateBetween(rtoDate, today, lastChanceDate)) {
                    return true;
                }
                return false;
            });
            return currentRTO[0];
        }
        return null;
    };

    useEffect(() => {
        if (
            localStorage.getItem("token") !== null &&
            localStorage.getItem("code") !== null
        ) {
            dispatch(fetchUsers());
            dispatch(getUser(localStorage.getItem("code")!));
            dispatch(fetchRTOs(localStorage.getItem("token")!));
            const today = new Date();
            const month = (today.getMonth() + 1).toString();
            const hour = today.getHours().toString();
            const minute = today.getMinutes().toString();
            const day =
                today.getDate().toString().padStart(2, "0") +
                "-" +
                month.padStart(2, "0") +
                "-" +
                today.getFullYear() +
                "T" +
                hour.padStart(2, "0") +
                ":" +
                minute.padStart(2, "0") +
                ":00";
            setCurrentDay(day);
            dispatch(getRTO(day, localStorage.getItem("token")!));
        }
    }, [dispatch]);

    const currentRTO = getCurrentRTO();

    return (
        <>
            <Header />
            {currentRTO !== null && currentRTO && (
                <div
                    className="container"
                    style={{
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100vh",
                    }}
                >
                    <br />
                    <div className="card-wrapper">
                        <div className="card">
                            <div className="card-body">
                                <h3 className="card-title h3">
                                    Benvenuto alla RTO del{" "}
                                    {getDate(
                                        currentRTO.date
                                    ).toLocaleDateString()}{" "}
                                    ore{" "}
                                    {getDate(currentRTO.date)
                                        .getHours()
                                        .toString()
                                        .padStart(2, "0")}
                                    :
                                    {getDate(currentRTO.date)
                                        .getMinutes()
                                        .toString()
                                        .padStart(2, "0")}
                                    :00
                                </h3>
                                <br />
                                {!validQr && hasScanned && (
                                    <>
                                        <h3 className="h3 text-danger">
                                            Il QR da te scansionato non è
                                            valido. Chiedi in segreteria per
                                            maggiori informazioni
                                        </h3>
                                    </>
                                )}
                                {!hasScanned && (
                                    <>
                                        <h4>
                                            Scansiona il QR Code in sezione per
                                            avere la possibilità di confermare
                                            la tua presenza
                                        </h4>
                                        <br />
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => {
                                                setStartScan(!startScan);
                                            }}
                                        >
                                            {startScan
                                                ? "Stop Scan"
                                                : "Start Scan"}
                                        </button>
                                        <br />
                                        <br />
                                        {startScan && (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <>
                                                    <select
                                                        onChange={(e) =>
                                                            setSelected(
                                                                e.target.value
                                                            )
                                                        }
                                                    >
                                                        <option
                                                            value={
                                                                "environment"
                                                            }
                                                        >
                                                            Back Camera
                                                        </option>
                                                        <option value={"user"}>
                                                            Front Camera
                                                        </option>
                                                    </select>
                                                    <QrReader
                                                        containerStyle={{
                                                            width: "50%",
                                                            height: "50%",
                                                        }}
                                                        constraints={{
                                                            facingMode:
                                                                selected,
                                                        }}
                                                        scanDelay={500}
                                                        onResult={(
                                                            result,
                                                            error
                                                        ) => {
                                                            if (!!result) {
                                                                handleScan(
                                                                    result
                                                                );
                                                            }

                                                            if (!!error) {
                                                                handleError(
                                                                    error
                                                                );
                                                            }
                                                        }}
                                                    />
                                                </>
                                            </div>
                                        )}
                                        {loadingScan && <p>Loading</p>}
                                    </>
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

export default QRCodeScanner;
