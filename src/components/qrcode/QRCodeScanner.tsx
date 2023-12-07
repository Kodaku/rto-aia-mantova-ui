import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import Header from "../UI/Header";
import { fetchUsers, getUser } from "../../store/usersActions";
import { fetchRTOs, getRTO } from "../../store/rtosActions";
import { Link, useNavigate } from "react-router-dom";
// import { Html5QrcodeScanner } from "html5-qrcode";
// import { QrReader } from "react-qr-reader";
// import { Result } from "@zxing/library";
import { fetchUserJustifications } from "../../store/justificationsActions";
import axios from "axios";
import { HOST } from "../../constants";
import { User } from "../../types";

const QRCodeScanner = () => {
  const rtos = useAppSelector((state) => state.rtos.rtos);
  const currentUser = useAppSelector((state) => state.users.currentUser);
  const dispatch = useAppDispatch();
  const [currentDay, setCurrentDay] = useState<string>("");
  //   const [selected, setSelected] = useState("user");
  //   const [startScan, setStartScan] = useState(false);
  //   const [loadingScan, setLoadingScan] = useState(false);
  const chiaveRef = useRef<HTMLInputElement>(null);
  const [isValid, setIsValid] = useState(false);
  //   const [validQr, setValidQr] = useState(false);
  //   const [hasScanned, setHasScanned] = useState(false);
  const navigate = useNavigate();

  //   const handleScan = async (scanData: SetStateAction<string> | Result) => {
  //     setLoadingScan(true);
  //     // console.log(`loaded data data`, scanData);
  //     if (scanData && scanData !== "" && startScan && !hasScanned) {
  //       setHasScanned(true);
  //       const currentRTO = getCurrentRTO();
  //       if (
  //         currentRTO !== null &&
  //         scanData.toString() === currentRTO.qrcode.toString()
  //       ) {
  //         console.log("VALID SCAN!");
  //         setValidQr(true);
  //         navigate("/rto");
  //       }
  //       setStartScan(false);
  //       setLoadingScan(false);
  //       // setPrecScan(scanData);
  //     }
  //   };
  //   const handleError = (err: Error) => {};

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
        console.log(currentDay);
        const today = getDate(currentDay);
        console.log(today, rtoDate);
        if (checkDateBetween(rtoDate, today, lastChanceDate)) {
          return true;
        }
        return false;
      });
      if (currentRTO[0]) {
        const categorieEstese = currentRTO[0].categorieEstese.map((categoria) =>
          categoria.replaceAll(" ", "")
        );
        console.log(currentRTO);
        console.log(currentUser);
        // Check if the RTO is for the user
        if (
          currentRTO[0].codiciCategoria.includes(currentUser.codiceCategoria) &&
          categorieEstese.includes(currentUser.categoriaEstesa)
        ) {
          return currentRTO[0];
        }
      }
      return null;
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

  const currentRTO = getCurrentRTO();

  const submitHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    if (chiaveRef.current && isValid && currentRTO) {
      if (chiaveRef.current.value.length === 5) {
        // dispatch(getUser(chiaveRef.current.value));
        const response = await axios.get(
          HOST +
            `/rtos/${currentRTO.dataRTO}/${currentUser.codiceMeccanografico}/${chiaveRef.current.value}`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        const data = await response.data;
        if (data !== null) {
          //   localStorage.setItem("code", data.codiceMeccanografico);
          navigate("/rto");
        } else {
          setIsValid(false);
        }
      }
    }
  };

  return (
    <>
      <Header />
      {currentRTO !== null && currentRTO && (
        <div
          className="container"
          style={{
            textAlign: "center",
            // display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <div className="card-wrapper">
            <div className="card">
              <div className="card-body">
                <h3 className="card-title h3">
                  Benvenuto alla RTO del{" "}
                  {getDate(currentRTO.dataRTO).toLocaleDateString()} ore{" "}
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
                {/* {!validQr && (
                  <>
                    <h3 className="h3 text-danger">
                      Il QR da te scansionato non è valido. Chiedi in segreteria
                      per maggiori informazioni
                    </h3>
                  </>
                )} */}

                <>
                  <h4>
                    Scansiona il QR Code in sezione con un'apposita applicazione
                    e inserisci qui il codice numerico
                  </h4>
                  {/* <button
                      className="btn btn-primary"
                      onClick={() => {
                        setStartScan(!startScan);
                      }}
                    >
                      {startScan ? "Stop Scan" : "Start Scan"}
                    </button> */}
                  {/* {startScan && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <>
                          <select onChange={(e) => setSelected(e.target.value)}>
                            <option value={"environment"}>Back Camera</option>
                            <option value={"user"}>Front Camera</option>
                          </select>
                          <QrReader
                            containerStyle={{
                              width: "50%",
                              height: "50%",
                            }}
                            constraints={{
                              facingMode: selected,
                            }}
                            scanDelay={500}
                            onResult={(result, error) => {
                              if (!!result) {
                                handleScan(result);
                              }

                              if (!!error) {
                                handleError(error);
                              }
                            }}
                          />
                        </>
                      </div>
                    )}
                    {loadingScan && <p>Loading</p>} */}
                  <form
                    style={{ background: "rgba(0, 0, 0, 0.05)" }}
                    onSubmit={submitHandler}
                    id="validateMe"
                  >
                    <br />
                    <h5 className="h6">
                      Inserisci il codice che corrisponde al QR da te
                      scansionato
                    </h5>
                    <br />
                    <div className="row">
                      <div className="col-4"></div>
                      <div className="form-group col-md-4">
                        <label htmlFor="chiaveWeb">Codice QR</label>
                        <input
                          ref={chiaveRef}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            setIsValid(e.target.value.length === 5);
                          }}
                          type="text"
                          className={`form-control ${
                            !isValid
                              ? "is-invalid"
                              : "just-validate-success-field"
                          }`}
                          id="chiaveWeb"
                          aria-label="chiaveWeb"
                          required
                        />
                        {!isValid && (
                          <div className="form-feedback just-validate-error-label">
                            Codice QR non valido
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="row">
                      <div className="form-group col text-center">
                        <button
                          id="buttonSubmitChiaveVerbale"
                          type="submit"
                          className="btn btn-primary"
                        >
                          Conferma
                        </button>
                      </div>
                    </div>
                  </form>
                </>
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
                  Al momento non ci sono RTO di cui confermare la presenza!
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
