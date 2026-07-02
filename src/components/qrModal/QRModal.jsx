import { useState } from "react";
import { Modal } from "react-bootstrap";
import { QRCode } from "react-qrcode-logo";
import SubirImagen from "../subirImagenes/subirImagen.jsx";
import styles from "./QRModal.module.css";

export default function QRModal({ show, onHide, url, titulo }) {
    const [fgColor, setFgColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [qrStyle, setQrStyle] = useState("squares");
    const [eyeRadius, setEyeRadius] = useState(0);
    const [logoImage, setLogoImage] = useState("");

    const downloadQR = () => {
        const canvas = document.getElementById("multilink-qr-code");
        if (canvas) {
            const pngUrl = canvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");
            let downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `QR_${titulo || "Multilink"}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" contentClassName={styles.modalContent}>
            <Modal.Header closeButton closeVariant="white" className={styles.modalHeader}>
                <Modal.Title>
                    <i className="bi bi-qr-code"></i> Generar QR: {titulo}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className={styles.modalBody}>
                <div className="row g-4">
                    {/* Controles de Personalización */}
                    <div className="col-md-7">
                        <div className={styles.sectionTitle}>1. Colores</div>
                        <div className="row g-3 mb-4">
                            <div className="col-6">
                                <label className={styles.label}>Color de la forma</label>
                                <input 
                                    type="color" 
                                    className={styles.colorInput} 
                                    value={fgColor} 
                                    onChange={(e) => setFgColor(e.target.value)} 
                                />
                            </div>
                            <div className="col-6">
                                <label className={styles.label}>Color de fondo</label>
                                <input 
                                    type="color" 
                                    className={styles.colorInput} 
                                    value={bgColor} 
                                    onChange={(e) => setBgColor(e.target.value)} 
                                />
                            </div>
                        </div>

                        <div className={styles.sectionTitle}>2. Estilo</div>
                        <div className="row g-3 mb-4">
                            <div className="col-6">
                                <label className={styles.label}>Forma</label>
                                <select 
                                    className={styles.input} 
                                    value={qrStyle} 
                                    onChange={(e) => setQrStyle(e.target.value)}
                                >
                                    <option value="squares">Cuadrados</option>
                                    <option value="dots">Puntos</option>
                                </select>
                            </div>
                            <div className="col-6">
                                <label className={styles.label}>Redondeo de Esquinas</label>
                                <div className="d-flex align-items-center">
                                    <input 
                                        type="range" 
                                        className="form-range" 
                                        min="0" 
                                        max="20" 
                                        value={eyeRadius} 
                                        onChange={(e) => setEyeRadius(Number(e.target.value))}
                                    />
                                    <span className="ms-2" style={{ color: '#fff' }}>{eyeRadius}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.sectionTitle}>3. Logotipo en el Centro (Opcional)</div>
                        <div className="mb-3">
                            <SubirImagen 
                                urlInicial={logoImage} 
                                carpeta="qr_logos" 
                                onUploadSuccess={(url) => setLogoImage(url || "")} 
                            />
                        </div>
                    </div>

                    {/* Vista Previa del QR */}
                    <div className="col-md-5 d-flex flex-column align-items-center justify-content-start">
                        <div className={styles.previewContainer}>
                            <QRCode 
                                id="multilink-qr-code"
                                value={url}
                                size={220}
                                fgColor={fgColor}
                                bgColor={bgColor}
                                qrStyle={qrStyle}
                                eyeRadius={[
                                    [eyeRadius, eyeRadius, eyeRadius, eyeRadius],
                                    [eyeRadius, eyeRadius, eyeRadius, eyeRadius],
                                    [eyeRadius, eyeRadius, eyeRadius, eyeRadius]
                                ]}
                                logoImage={logoImage}
                                logoWidth={50}
                                logoHeight={50}
                                removeQrCodeBehindLogo={true}
                                logoPadding={3}
                                ecLevel="H"
                            />
                        </div>
                        <div className="mt-4 w-100">
                            <button className={styles.btnDownload} onClick={downloadQR}>
                                <i className="bi bi-download"></i> Descargar QR (.png)
                            </button>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
}
