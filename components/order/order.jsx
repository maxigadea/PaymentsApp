import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { QRCodeSVG } from 'qrcode.react';
import MetamaskLogo from '../../assets/metamask.png';
var axios = require('axios');

const Order = () => {
    const router = useRouter();
    const [details, setDetails] = useState({});
    const [socket, setSocket] = useState({});
    const [selectedKey, setSelectedKey] = useState(1);
    const [timer, setTimer] = useState(900000);

    const interval = setInterval(function() {
        setTimer(timer =- 1000)
      }, 1000);
    clearInterval(interval); 

    useEffect(() => {
        var id = window.location.pathname.substr(7);
        requestDetailsOrder(id);
    }, []);

    useEffect(() => {
        var id = window.location.pathname.substr(7);
        const ws = new WebSocket(`wss://payments.smsdata.com/ws/${id}`);
        setSocket(ws);
    }, []);

    if (typeof window !== 'undefined') {
        // client-side-only code
        socket.onopen = () => console.log("connected");
        socket.onmessage = function (event) {
            const json = JSON.parse(event.data);
            try {
                if (json) {
                    if (json.status === "CO") {
                        window.open(details.url_ok, '_self')
                    }
                    if (json.status === "EX" || json.data.status === "OC") {
                        window.open(details.url_ko, '_self')
                    }
                }
            } catch (err) {
                console.log(err);
            }
        };
    }

    const requestDetailsOrder = (id) => {
        var config = {
            method: 'get',
            url: `https://payments.smsdata.com/api/v1/orders/info/${id}`,
            headers: {
                'X-Merchant-Id': process.env.NEXT_PUBLIC_MERCHANTID
            }
        };
        axios(config)
            .then(function (response) {
                setDetails(response.data[0]);
            })
            .catch(function (error) {
                console.log(error);
            });
    };


    const renderSelectionPaymentMethods = () => {
        if (selectedKey === 1) {
            return (
                <div className="alignQR">
                    <QRCodeSVG value={details.address} />
                </div>
            );
        }

        if (selectedKey === 2) {
            return (
                <div className="alignQR">
                    <QRCodeSVG value={details.address} />
                </div>
            );
        }

        if (selectedKey === 3) {
            return (
                <div className="containerMetamaskLogo">
                    <button onClick={onPressMetamask}>
                        <Image className="MetamaskLogo" src={MetamaskLogo} />
                    </button>
                </div>
            )
        }
    };

    async function isConnected() {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length) {
            return true;
        } else {
            return false
        }
    }

    const onPressMetamask = async () => {
        let metamask;
        var accounts = [];
        if (typeof window !== 'undefined') {
            metamask = window.ethereum;
        }
        try {
            var isConnectedBool = await isConnected();
            const parsedAmount = ethers.utils.parseEther(details.crypto_amount.toString());
            if (!metamask) return alert('Please install metamask')
            if (!isConnectedBool) {
                accounts = await metamask.request({ method: 'eth_requestAccounts' })
            } else {
                accounts = await ethereum.request({ method: 'eth_accounts' });
            }
            debugger
            if (accounts.length) {
                await metamask.request({
                    method: 'eth_sendTransaction',
                    params: [
                        {
                            from: accounts[0],
                            to: details.address,
                            gas: '0x7EF40', //52000 GWEI
                            value: parsedAmount._hex,
                        },
                    ],
                });
            }
        } catch (error) {
            console.error(error);
            throw new Error('No ethereum object. ')
        }
    };


    return (
        <div className="containerGeneral">
            <div className="containerOne">
                <h2 className="titleResumen">Resumen del pedido</h2>
                <div className="containerResumenOrderView">
                    <div className="containerItemsOrderView">
                        <div className="containerItemOne">
                            <div className="itemOne">
                                <p className="pImporte"> Importe: </p>
                                <p className="pCurrency"> {details.fiat_amount} EUR</p>
                                <div className="line"></div>
                            </div>
                        </div>
                        <div className="containerItemCurrencyOrderView">
                            <div className="itemOne">
                                <p className="pCurrencySeleccionada"> Moneda seleccionada: </p>
                                <p className="pCurrencySeleccionadaTwo">{details.currency_id}</p>
                            </div>
                            <div className="lineThree"></div>
                        </div>
                        <div className="containerItemTwo">
                            <div className="itemTwo">
                                <div className="containerComercioOrderView">
                                    <p className="pComercioOne"> Comercio:</p>
                                    <p className="comercioTwoOrderView"> La Tiendita Crypto</p>
                                </div>
                                <div>
                                    <p className="fechaOne"> Fecha:</p>
                                    <p className="pfechaTwoOrderView">{details.created_at?.substr(0, 16).replace('T', '  ')}</p>
                                </div>
                                <div className="lineTwo"></div>
                            </div>
                        </div>
                        <div className="containerConcepto">
                            <p className="pConcepto">Concepto</p>
                            <p className="pConceptoTwoOrderView">{details.notes}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="containerTwoOrderView">
                <h2 className="titleResumen">Realiza el pago</h2>
                <div className="containerResumenConfirmPayment">
                    <div className="containerOrderPayment">
                        <div className="containerItemOnePayment">
                            <div className="styleIconTimer">
                                <svg width="60" height="24" viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 22.75C6.76 22.75 2.5 18.49 2.5 13.25C2.5 8.01 6.76 3.75 12 3.75C17.24 3.75 21.5 8.01 21.5 13.25C21.5 18.49 17.24 22.75 12 22.75ZM12 5.25C7.59 5.25 4 8.84 4 13.25C4 17.66 7.59 21.25 12 21.25C16.41 21.25 20 17.66 20 13.25C20 8.84 16.41 5.25 12 5.25Z" fill="#002859" />
                                    <path d="M12 13.75C11.59 13.75 11.25 13.41 11.25 13V8C11.25 7.59 11.59 7.25 12 7.25C12.41 7.25 12.75 7.59 12.75 8V13C12.75 13.41 12.41 13.75 12 13.75Z" fill="#002859" />
                                    <path d="M15 2.75H9C8.59 2.75 8.25 2.41 8.25 2C8.25 1.59 8.59 1.25 9 1.25H15C15.41 1.25 15.75 1.59 15.75 2C15.75 2.41 15.41 2.75 15 2.75Z" fill="#002859" />
                                    <path d="M31.7855 17.108C30.8095 17.108 30.0575 16.736 29.5295 15.992C29.0095 15.24 28.7495 14.164 28.7495 12.764C28.7495 11.34 29.0095 10.264 29.5295 9.536C30.0575 8.8 30.8095 8.432 31.7855 8.432C32.7695 8.432 33.5215 8.8 34.0415 9.536C34.5615 10.264 34.8215 11.336 34.8215 12.752C34.8215 14.16 34.5575 15.24 34.0295 15.992C33.5095 16.736 32.7615 17.108 31.7855 17.108ZM31.7855 16.064C32.4015 16.064 32.8575 15.796 33.1535 15.26C33.4575 14.724 33.6095 13.888 33.6095 12.752C33.6095 11.608 33.4575 10.776 33.1535 10.256C32.8575 9.728 32.4015 9.464 31.7855 9.464C31.1775 9.464 30.7215 9.728 30.4175 10.256C30.1135 10.776 29.9615 11.604 29.9615 12.74C29.9615 13.884 30.1135 14.724 30.4175 15.26C30.7295 15.796 31.1855 16.064 31.7855 16.064ZM39.1009 17.108C38.7329 17.108 38.3689 17.068 38.0089 16.988C37.6489 16.908 37.3129 16.796 37.0009 16.652C36.6889 16.5 36.4169 16.32 36.1849 16.112L36.6169 15.164C37.0009 15.46 37.3929 15.684 37.7929 15.836C38.2009 15.98 38.6289 16.052 39.0769 16.052C39.6449 16.052 40.0889 15.904 40.4089 15.608C40.7369 15.312 40.9009 14.916 40.9009 14.42C40.9009 13.908 40.7449 13.496 40.4329 13.184C40.1289 12.864 39.7049 12.704 39.1609 12.704C38.7849 12.704 38.4409 12.78 38.1289 12.932C37.8249 13.084 37.5569 13.316 37.3249 13.628H36.4609V8.54H41.5849V9.584H37.6489V12.632H37.3369C37.5529 12.328 37.8409 12.092 38.2009 11.924C38.5689 11.756 38.9809 11.672 39.4369 11.672C39.9809 11.672 40.4529 11.784 40.8529 12.008C41.2529 12.232 41.5609 12.544 41.7769 12.944C42.0009 13.344 42.1129 13.816 42.1129 14.36C42.1129 14.904 41.9889 15.384 41.7409 15.8C41.5009 16.208 41.1529 16.528 40.6969 16.76C40.2489 16.992 39.7169 17.108 39.1009 17.108ZM43.2842 12.38V10.952H44.7122V12.38H43.2842ZM43.2842 17V15.572H44.7122V17H43.2842ZM49.0238 17.108C48.0478 17.108 47.2958 16.736 46.7678 15.992C46.2478 15.24 45.9878 14.164 45.9878 12.764C45.9878 11.34 46.2478 10.264 46.7678 9.536C47.2958 8.8 48.0478 8.432 49.0238 8.432C50.0078 8.432 50.7598 8.8 51.2798 9.536C51.7998 10.264 52.0598 11.336 52.0598 12.752C52.0598 14.16 51.7958 15.24 51.2678 15.992C50.7478 16.736 49.9998 17.108 49.0238 17.108ZM49.0238 16.064C49.6398 16.064 50.0958 15.796 50.3918 15.26C50.6958 14.724 50.8478 13.888 50.8478 12.752C50.8478 11.608 50.6958 10.776 50.3918 10.256C50.0958 9.728 49.6398 9.464 49.0238 9.464C48.4158 9.464 47.9598 9.728 47.6558 10.256C47.3518 10.776 47.1998 11.604 47.1998 12.74C47.1998 13.884 47.3518 14.724 47.6558 15.26C47.9678 15.796 48.4238 16.064 49.0238 16.064ZM56.2191 17.108C55.2431 17.108 54.4831 16.9 53.9391 16.484C53.3951 16.068 53.1231 15.488 53.1231 14.744C53.1231 14.152 53.3031 13.664 53.6631 13.28C54.0231 12.888 54.4951 12.652 55.0791 12.572V12.788C54.5511 12.676 54.1271 12.432 53.8071 12.056C53.4951 11.68 53.3391 11.224 53.3391 10.688C53.3391 9.984 53.5951 9.432 54.1071 9.032C54.6191 8.632 55.3231 8.432 56.2191 8.432C57.1231 8.432 57.8311 8.632 58.3431 9.032C58.8551 9.432 59.1111 9.984 59.1111 10.688C59.1111 11.224 58.9591 11.684 58.6551 12.068C58.3591 12.444 57.9511 12.68 57.4311 12.776V12.572C58.0071 12.652 58.4671 12.888 58.8111 13.28C59.1551 13.664 59.3271 14.152 59.3271 14.744C59.3271 15.488 59.0551 16.068 58.5111 16.484C57.9671 16.9 57.2031 17.108 56.2191 17.108ZM56.2191 16.124C56.8671 16.124 57.3511 16.004 57.6711 15.764C57.9911 15.516 58.1511 15.148 58.1511 14.66C58.1511 14.172 57.9911 13.808 57.6711 13.568C57.3511 13.328 56.8671 13.208 56.2191 13.208C55.5711 13.208 55.0871 13.328 54.7671 13.568C54.4471 13.808 54.2871 14.172 54.2871 14.66C54.2871 15.148 54.4471 15.516 54.7671 15.764C55.0951 16.004 55.5791 16.124 56.2191 16.124ZM56.2191 12.224C56.7791 12.224 57.2031 12.1 57.4911 11.852C57.7871 11.596 57.9351 11.248 57.9351 10.808C57.9351 10.376 57.7871 10.036 57.4911 9.788C57.2031 9.54 56.7791 9.416 56.2191 9.416C55.6671 9.416 55.2431 9.54 54.9471 9.788C54.6511 10.036 54.5031 10.376 54.5031 10.808C54.5031 11.248 54.6511 11.596 54.9471 11.852C55.2431 12.1 55.6671 12.224 56.2191 12.224Z" fill="#002859" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="containerHeaderButtons">
                        <button onClick={function () { setSelectedKey(1) }} className="containerSmartQR">
                            Smart QR
                        </button>
                        <div className="containerSpaceOne"></div>
                        <div className="containerWalletQR">
                            <button onClick={function () { setSelectedKey(2) }} className="pWalletQR">Wallet QR</button>
                            <div className="containerSpaceTwo"></div>
                        </div>
                        <div className="containerWalletQR">
                            <button onClick={function () { setSelectedKey(3) }} className="pWalletQR">Web 3</button>
                        </div>
                    </div>
                    <div className="containerQR">
                        {
                            renderSelectionPaymentMethods()
                        }
                    </div>
                    <div className="containerDetails">
                        <div className="containerDetailsOne">
                            <p className="pDetailsOne">Enviar <span className="spanText">{details.crypto_amount} {details.currency_id}</span></p>
                            <button className="buttonDetailsOne">
                                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M8.75 7.8125C8.23223 7.8125 7.8125 8.23223 7.8125 8.75V15.5C7.8125 16.0178 8.23223 16.4375 8.75 16.4375H15.5C16.0178 16.4375 16.4375 16.0178 16.4375 15.5V8.75C16.4375 8.23223 16.0178 7.8125 15.5 7.8125H8.75ZM6.6875 8.75C6.6875 7.61091 7.61091 6.6875 8.75 6.6875H15.5C16.6391 6.6875 17.5625 7.61091 17.5625 8.75V15.5C17.5625 16.6391 16.6391 17.5625 15.5 17.5625H8.75C7.61091 17.5625 6.6875 16.6391 6.6875 15.5V8.75Z" fill="#0465DD" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M3.5 2.5625C3.25136 2.5625 3.0129 2.66127 2.83709 2.83709C2.66127 3.0129 2.5625 3.25136 2.5625 3.5V10.25C2.5625 10.4986 2.66127 10.7371 2.83709 10.9129C3.0129 11.0887 3.25136 11.1875 3.5 11.1875H4.25C4.56066 11.1875 4.8125 11.4393 4.8125 11.75C4.8125 12.0607 4.56066 12.3125 4.25 12.3125H3.5C2.95299 12.3125 2.42839 12.0952 2.04159 11.7084C1.6548 11.3216 1.4375 10.797 1.4375 10.25V3.5C1.4375 2.95299 1.6548 2.42839 2.04159 2.04159C2.42839 1.6548 2.95299 1.4375 3.5 1.4375H10.25C10.797 1.4375 11.3216 1.6548 11.7084 2.04159C12.0952 2.42839 12.3125 2.95299 12.3125 3.5V4.25C12.3125 4.56066 12.0607 4.8125 11.75 4.8125C11.4393 4.8125 11.1875 4.56066 11.1875 4.25V3.5C11.1875 3.25136 11.0887 3.0129 10.9129 2.83709C10.7371 2.66127 10.4986 2.5625 10.25 2.5625H3.5Z" fill="#0465DD" />
                                </svg>
                            </button>
                        </div>
                        <div className="containerDetailsTwo">
                            <p className="pDetailsTwo">{details.address}</p>
                            <div className="containerButtonCopy">
                                <button className="buttonDetailsTwo">
                                    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M8.75 7.8125C8.23223 7.8125 7.8125 8.23223 7.8125 8.75V15.5C7.8125 16.0178 8.23223 16.4375 8.75 16.4375H15.5C16.0178 16.4375 16.4375 16.0178 16.4375 15.5V8.75C16.4375 8.23223 16.0178 7.8125 15.5 7.8125H8.75ZM6.6875 8.75C6.6875 7.61091 7.61091 6.6875 8.75 6.6875H15.5C16.6391 6.6875 17.5625 7.61091 17.5625 8.75V15.5C17.5625 16.6391 16.6391 17.5625 15.5 17.5625H8.75C7.61091 17.5625 6.6875 16.6391 6.6875 15.5V8.75Z" fill="#0465DD" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M3.5 2.5625C3.25136 2.5625 3.0129 2.66127 2.83709 2.83709C2.66127 3.0129 2.5625 3.25136 2.5625 3.5V10.25C2.5625 10.4986 2.66127 10.7371 2.83709 10.9129C3.0129 11.0887 3.25136 11.1875 3.5 11.1875H4.25C4.56066 11.1875 4.8125 11.4393 4.8125 11.75C4.8125 12.0607 4.56066 12.3125 4.25 12.3125H3.5C2.95299 12.3125 2.42839 12.0952 2.04159 11.7084C1.6548 11.3216 1.4375 10.797 1.4375 10.25V3.5C1.4375 2.95299 1.6548 2.42839 2.04159 2.04159C2.42839 1.6548 2.95299 1.4375 3.5 1.4375H10.25C10.797 1.4375 11.3216 1.6548 11.7084 2.04159C12.0952 2.42839 12.3125 2.95299 12.3125 3.5V4.25C12.3125 4.56066 12.0607 4.8125 11.75 4.8125C11.4393 4.8125 11.1875 4.56066 11.1875 4.25V3.5C11.1875 3.25136 11.0887 3.0129 10.9129 2.83709C10.7371 2.66127 10.4986 2.5625 10.25 2.5625H3.5Z" fill="#0465DD" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="containerDetailsThree">
                            <div className="containerInformationIcon">
                                <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path opacity="0.4" d="M21.58 8.58003V15.42C21.58 16.54 20.9799 17.58 20.0099 18.15L14.0699 21.58C13.0999 22.14 11.8999 22.14 10.9199 21.58L4.97992 18.15C4.00992 17.59 3.40991 16.55 3.40991 15.42V8.58003C3.40991 7.46003 4.00992 6.41999 4.97992 5.84999L10.9199 2.42C11.8899 1.86 13.0899 1.86 14.0699 2.42L20.0099 5.84999C20.9799 6.41999 21.58 7.45003 21.58 8.58003Z" fill="#FFC82C" />
                                    <path d="M12.5 10.5C12.91 10.5 13.25 10.84 13.25 11.25L13.25 16.5C13.25 16.91 12.91 17.25 12.5 17.25C12.09 17.25 11.75 16.91 11.75 16.5L11.75 11.25C11.75 10.84 12.09 10.5 12.5 10.5Z" fill="#002859" />
                                    <path d="M12.5 7.00014C12.63 7.00014 12.76 7.03016 12.88 7.08016C13.01 7.13016 13.11 7.20012 13.21 7.29012C13.3 7.39012 13.37 7.50014 13.43 7.62014C13.48 7.74014 13.5 7.87014 13.5 8.00014C13.5 8.26014 13.4 8.52016 13.21 8.71016C13.11 8.80016 13.01 8.87012 12.88 8.92012C12.51 9.08012 12.07 8.99016 11.79 8.71016C11.7 8.61016 11.63 8.51015 11.58 8.38015C11.53 8.26015 11.5 8.13014 11.5 8.00014C11.5 7.87014 11.53 7.74014 11.58 7.62014C11.63 7.50014 11.7 7.39012 11.79 7.29012C11.98 7.10012 12.23 7.00014 12.5 7.00014Z" fill="#002859" />
                                </svg>
                            </div>
                            <p className="pDetailsThree">Etiqueta de destino: {details.reference ? details.reference : '0000000'}</p>
                            <div className="containerButtonCopy">
                                <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M8.75 7.3125C8.23223 7.3125 7.8125 7.73223 7.8125 8.25V15C7.8125 15.5178 8.23223 15.9375 8.75 15.9375H15.5C16.0178 15.9375 16.4375 15.5178 16.4375 15V8.25C16.4375 7.73223 16.0178 7.3125 15.5 7.3125H8.75ZM6.6875 8.25C6.6875 7.11091 7.61091 6.1875 8.75 6.1875H15.5C16.6391 6.1875 17.5625 7.11091 17.5625 8.25V15C17.5625 16.1391 16.6391 17.0625 15.5 17.0625H8.75C7.61091 17.0625 6.6875 16.1391 6.6875 15V8.25Z" fill="#0465DD" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M3.5 2.0625C3.25136 2.0625 3.0129 2.16127 2.83709 2.33709C2.66127 2.5129 2.5625 2.75136 2.5625 3V9.75C2.5625 9.99864 2.66127 10.2371 2.83709 10.4129C3.0129 10.5887 3.25136 10.6875 3.5 10.6875H4.25C4.56066 10.6875 4.8125 10.9393 4.8125 11.25C4.8125 11.5607 4.56066 11.8125 4.25 11.8125H3.5C2.95299 11.8125 2.42839 11.5952 2.04159 11.2084C1.6548 10.8216 1.4375 10.297 1.4375 9.75V3C1.4375 2.45299 1.6548 1.92839 2.04159 1.54159C2.42839 1.1548 2.95299 0.9375 3.5 0.9375H10.25C10.797 0.9375 11.3216 1.1548 11.7084 1.54159C12.0952 1.92839 12.3125 2.45299 12.3125 3V3.75C12.3125 4.06066 12.0607 4.3125 11.75 4.3125C11.4393 4.3125 11.1875 4.06066 11.1875 3.75V3C11.1875 2.75136 11.0887 2.5129 10.9129 2.33709C10.7371 2.16127 10.4986 2.0625 10.25 2.0625H3.5Z" fill="#0465DD" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                </div>
            </div>
            <div className="containerFooter">
                <div className="containerBitnovoOne">
                    <svg width="49" height="8" viewBox="0 0 49 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 6.11423V0.257529H2.61146C3.2848 0.257529 3.80346 0.407061 4.16742 0.706127C4.53139 0.999654 4.71337 1.40948 4.71337 1.93562C4.71337 2.45068 4.53139 2.86051 4.16742 3.16511C3.80346 3.46417 3.2848 3.61371 2.61146 3.61371H0.755232V6.11423H0ZM0.755232 3.0405H2.53867C3.00576 3.0405 3.3576 2.94358 3.59418 2.74974C3.83682 2.5559 3.95814 2.28453 3.95814 1.93562C3.95814 1.58117 3.83682 1.30703 3.59418 1.11319C3.3576 0.919349 3.00576 0.82243 2.53867 0.82243H0.755232V3.0405Z" fill="#C0CCDA" />
                        <path d="M7.51507 6.18899C7.07831 6.18899 6.69614 6.10315 6.36857 5.93146C6.04707 5.75424 5.79836 5.50502 5.62244 5.1838C5.44652 4.85704 5.35856 4.47214 5.35856 4.02908C5.35856 3.58048 5.44652 3.19557 5.62244 2.87435C5.79836 2.55313 6.04707 2.30668 6.36857 2.13499C6.69614 1.95777 7.07831 1.86916 7.51507 1.86916C7.9579 1.86916 8.34006 1.95777 8.66156 2.13499C8.98914 2.30668 9.24088 2.55313 9.4168 2.87435C9.59878 3.19557 9.68977 3.58048 9.68977 4.02908C9.68977 4.47214 9.59878 4.85704 9.4168 5.1838C9.24088 5.50502 8.98914 5.75424 8.66156 5.93146C8.34006 6.10315 7.9579 6.18899 7.51507 6.18899ZM7.51507 5.64071C7.95183 5.64071 8.2976 5.50502 8.55237 5.23364C8.80715 4.95673 8.93454 4.55521 8.93454 4.02908C8.93454 3.4974 8.80412 3.09588 8.54328 2.82451C8.2885 2.54759 7.94576 2.40914 7.51507 2.40914C7.08437 2.40914 6.74164 2.54759 6.48686 2.82451C6.23208 3.09588 6.1047 3.4974 6.1047 4.02908C6.1047 4.55521 6.23208 4.95673 6.48686 5.23364C6.74164 5.50502 7.08437 5.64071 7.51507 5.64071Z" fill="#C0CCDA" />
                        <path d="M11.996 6.11423L10.3035 1.94393H11.0861L12.4964 5.61578H12.2599L13.7157 1.94393H14.3527L15.7812 5.61578H15.5538L16.9732 1.94393H17.7194L16.0178 6.11423H15.3081L13.834 2.38422H14.198L12.7148 6.11423H11.996Z" fill="#C0CCDA" />
                        <path d="M20.6521 6.18899C19.9363 6.18899 19.3721 6.00069 18.9596 5.62409C18.5471 5.24195 18.3409 4.71305 18.3409 4.03738C18.3409 3.59986 18.4319 3.22049 18.6139 2.89927C18.7958 2.57252 19.0506 2.32053 19.3782 2.1433C19.7058 1.96054 20.0819 1.86916 20.5065 1.86916C20.9251 1.86916 21.2769 1.94946 21.562 2.11007C21.8471 2.27068 22.0655 2.50052 22.2171 2.79958C22.3688 3.09311 22.4446 3.44202 22.4446 3.84631V4.09553H18.905V3.67186H21.9624L21.8077 3.77985C21.8077 3.33679 21.6985 2.99065 21.4801 2.74143C21.2617 2.49221 20.9372 2.3676 20.5065 2.3676C20.0515 2.3676 19.6967 2.51437 19.4419 2.80789C19.1871 3.09588 19.0597 3.48633 19.0597 3.97923V4.054C19.0597 4.57459 19.1992 4.97058 19.4783 5.24195C19.7634 5.50779 20.1607 5.64071 20.6703 5.64071C20.9433 5.64071 21.198 5.60471 21.4346 5.53271C21.6773 5.45517 21.9078 5.33056 22.1261 5.15888L22.3809 5.6324C22.1807 5.80962 21.926 5.94808 21.6166 6.04777C21.3133 6.14192 20.9918 6.18899 20.6521 6.18899Z" fill="#C0CCDA" />
                        <path d="M23.5542 6.11423V2.94912C23.5542 2.78297 23.5482 2.61405 23.536 2.44237C23.53 2.27068 23.5178 2.10453 23.4996 1.94393H24.2094L24.3004 2.95743L24.173 2.96573C24.2336 2.71651 24.3398 2.5116 24.4914 2.35099C24.6431 2.19038 24.822 2.07131 25.0283 1.99377C25.2345 1.9107 25.4499 1.86916 25.6743 1.86916C25.7653 1.86916 25.8442 1.87193 25.9109 1.87747C25.9837 1.883 26.0504 1.89685 26.1111 1.919L26.102 2.51713C26.011 2.48944 25.9261 2.47283 25.8472 2.46729C25.7744 2.45621 25.6895 2.45068 25.5924 2.45068C25.3255 2.45068 25.092 2.50883 24.8918 2.62513C24.6977 2.74143 24.5491 2.89097 24.4459 3.07373C24.3489 3.25649 24.3004 3.45033 24.3004 3.65524V6.11423H23.5542Z" fill="#C0CCDA" />
                        <path d="M28.8538 6.18899C28.138 6.18899 27.5738 6.00069 27.1613 5.62409C26.7488 5.24195 26.5426 4.71305 26.5426 4.03738C26.5426 3.59986 26.6336 3.22049 26.8156 2.89927C26.9975 2.57252 27.2523 2.32053 27.5799 2.1433C27.9075 1.96054 28.2836 1.86916 28.7082 1.86916C29.1268 1.86916 29.4786 1.94946 29.7637 2.11007C30.0488 2.27068 30.2672 2.50052 30.4188 2.79958C30.5705 3.09311 30.6463 3.44202 30.6463 3.84631V4.09553H27.1067V3.67186H30.1641L30.0094 3.77985C30.0094 3.33679 29.9002 2.99065 29.6818 2.74143C29.4634 2.49221 29.1389 2.3676 28.7082 2.3676C28.2532 2.3676 27.8984 2.51437 27.6436 2.80789C27.3888 3.09588 27.2614 3.48633 27.2614 3.97923V4.054C27.2614 4.57459 27.4009 4.97058 27.68 5.24195C27.9651 5.50779 28.3624 5.64071 28.872 5.64071C29.145 5.64071 29.3997 5.60471 29.6363 5.53271C29.879 5.45517 30.1095 5.33056 30.3278 5.15888L30.5826 5.6324C30.3824 5.80962 30.1277 5.94808 29.8183 6.04777C29.515 6.14192 29.1935 6.18899 28.8538 6.18899Z" fill="#C0CCDA" />
                        <path d="M33.503 6.18899C33.1026 6.18899 32.7508 6.10315 32.4475 5.93146C32.1441 5.75424 31.9076 5.50502 31.7377 5.1838C31.5739 4.86258 31.492 4.47767 31.492 4.02908C31.492 3.57494 31.5739 3.18726 31.7377 2.86604C31.9076 2.54483 32.1441 2.29837 32.4475 2.12669C32.7508 1.955 33.1026 1.86916 33.503 1.86916C33.9155 1.86916 34.2703 1.96331 34.5676 2.15161C34.8709 2.33991 35.0741 2.59467 35.1772 2.91589H35.068V0H35.805V6.11423H35.0771V5.11734H35.1772C35.0802 5.44964 34.88 5.7127 34.5767 5.90654C34.2734 6.09484 33.9155 6.18899 33.503 6.18899ZM33.6576 5.64071C34.0883 5.64071 34.4341 5.50502 34.695 5.23364C34.9558 4.95673 35.0862 4.55521 35.0862 4.02908C35.0862 3.4974 34.9558 3.09588 34.695 2.82451C34.4341 2.54759 34.0883 2.40914 33.6576 2.40914C33.227 2.40914 32.8812 2.54759 32.6203 2.82451C32.3656 3.09588 32.2382 3.4974 32.2382 4.02908C32.2382 4.55521 32.3656 4.95673 32.6203 5.23364C32.8812 5.50502 33.227 5.64071 33.6576 5.64071Z" fill="#C0CCDA" />
                        <path d="M41.8956 6.18899C41.4831 6.18899 41.1282 6.09484 40.831 5.90654C40.5338 5.7127 40.3336 5.44964 40.2305 5.11734H40.3305V6.11423H39.6026V0H40.3396V2.91589H40.2305C40.3336 2.59467 40.5338 2.33991 40.831 2.15161C41.1282 1.96331 41.4831 1.86916 41.8956 1.86916C42.3081 1.86916 42.663 1.95777 42.9602 2.13499C43.2635 2.30668 43.4971 2.55313 43.6608 2.87435C43.8307 3.19557 43.9156 3.58048 43.9156 4.02908C43.9156 4.47767 43.8307 4.86258 43.6608 5.1838C43.491 5.50502 43.2544 5.75424 42.9511 5.93146C42.6539 6.10315 42.302 6.18899 41.8956 6.18899ZM41.7409 5.64071C42.1716 5.64071 42.5174 5.50502 42.7782 5.23364C43.0391 4.96227 43.1695 4.56075 43.1695 4.02908C43.1695 3.4974 43.0391 3.09588 42.7782 2.82451C42.5174 2.54759 42.1716 2.40914 41.7409 2.40914C41.3102 2.40914 40.9645 2.54759 40.7036 2.82451C40.4488 3.09588 40.3214 3.4974 40.3214 4.02908C40.3214 4.55521 40.4488 4.95673 40.7036 5.23364C40.9645 5.50502 41.3102 5.64071 41.7409 5.64071Z" fill="#C0CCDA" />
                        <path d="M44.8144 8L44.6415 7.44341C44.9266 7.38248 45.1632 7.31049 45.3512 7.22741C45.5453 7.14988 45.7061 7.04465 45.8335 6.91173C45.9609 6.77882 46.0701 6.61267 46.1611 6.41329L46.3976 5.92316L46.3794 6.20561L44.3867 1.94393H45.1874L46.8344 5.60748H46.5978L48.2266 1.94393H49L46.889 6.46314C46.7677 6.72897 46.6342 6.9505 46.4886 7.12773C46.343 7.31049 46.1853 7.45725 46.0155 7.56802C45.8517 7.68432 45.6697 7.7757 45.4695 7.84216C45.2693 7.90862 45.051 7.96123 44.8144 8Z" fill="#C0CCDA" />
                    </svg>
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M26 13C26 20.1797 20.1797 26 13 26C5.8203 26 0 20.1797 0 13C0 5.8203 5.8203 0 13 0C20.1797 0 26 5.8203 26 13ZM13.3236 21.5263C13.4323 20.9312 13.5374 20.3562 13.6324 19.7813C14.0565 19.7586 14.4626 19.7503 14.8584 19.7423C15.4 19.7312 15.9222 19.7205 16.4443 19.6741C17.9507 19.4328 18.9048 18.3607 19.2061 16.6988C19.4822 15.1174 19.1056 14.2596 17.6997 13.2679C17.6871 13.2545 17.6808 13.2344 17.6714 13.2042C17.662 13.1741 17.6495 13.1339 17.6243 13.0802C18.9048 12.5174 19.3065 11.3916 19.2563 10.0246C19.181 8.65757 18.3022 7.93386 17.2478 7.42458C17.015 7.31585 16.7653 7.20712 16.5037 7.09317C16.3138 7.01049 16.1177 6.92506 15.9171 6.83489C15.9917 6.41384 16.0618 5.99278 16.1312 5.57583C16.2253 5.01069 16.3181 4.45309 16.4192 3.91324C16.1431 3.85963 15.892 3.80603 15.6409 3.75242C15.3899 3.69881 15.1388 3.6452 14.8626 3.59159C14.7748 4.07406 14.6932 4.54984 14.6116 5.02561C14.53 5.50139 14.4484 5.97716 14.3605 6.45963C14.1776 6.42517 14.0085 6.39071 13.8394 6.35625C13.614 6.3103 13.3885 6.26435 13.1303 6.2184C13.2023 5.81183 13.2701 5.40976 13.3372 5.0122C13.4337 4.43999 13.5287 3.8771 13.6324 3.32355C13.0047 3.18953 12.4775 3.08231 11.9 2.9751C11.8415 3.30563 11.7829 3.63319 11.7243 3.96074C11.6072 4.61601 11.49 5.27127 11.3728 5.95036C11.0262 5.87987 10.6877 5.80937 10.3537 5.73983C9.67185 5.59783 9.00904 5.45981 8.33491 5.33386C8.20938 5.97716 8.10895 6.51324 8.00853 7.12974C8.21833 7.16174 8.41918 7.20328 8.61109 7.24298C8.7407 7.26979 8.86623 7.29575 8.98768 7.31736C9.66556 7.42458 9.91663 7.85345 9.7911 8.55035C9.59024 9.72974 9.38311 10.9091 9.17598 12.0885C8.96885 13.2679 8.76173 14.4473 8.56087 15.6266C8.48555 16.1895 8.20938 16.3236 7.73235 16.2431C6.62767 16.0823 6.62766 16.0823 6.25107 17.1813L6.25104 17.1814C6.17573 17.4494 6.10042 17.7174 6 18.0926C6.53982 18.1998 7.06082 18.3071 7.58181 18.4143C8.10274 18.5215 8.62367 18.6287 9.16343 18.7359C9.04454 19.3547 8.94324 19.9454 8.84391 20.5245C8.77544 20.9237 8.7079 21.3174 8.63619 21.7112C8.93747 21.7782 9.21992 21.8318 9.50237 21.8854C9.78482 21.939 10.0673 21.9926 10.3685 22.0596C10.4253 21.7393 10.4821 21.4246 10.538 21.1146C10.6552 20.4647 10.7687 19.8354 10.8707 19.2184C11.1289 19.2644 11.3544 19.3103 11.5798 19.3563C11.7489 19.3907 11.918 19.4252 12.1009 19.4596C12.0388 19.81 11.9799 20.1503 11.9218 20.4853C11.8156 21.0986 11.7124 21.6941 11.5988 22.3009C11.811 22.3421 12.0085 22.3793 12.2011 22.4157C12.5096 22.4739 12.8057 22.5297 13.1303 22.5957C13.1951 22.2296 13.26 21.8745 13.3236 21.5263ZM11.6374 15.0282C11.7417 14.4439 11.846 13.8596 11.9503 13.2411C12.253 13.3357 12.5535 13.4233 12.8512 13.5101C13.5659 13.7185 14.2644 13.9222 14.9379 14.206C15.7916 14.5813 16.118 15.305 15.9673 16.0823C15.8167 16.806 15.3145 17.3153 14.3856 17.3421C13.6818 17.3604 12.9898 17.2911 12.2774 17.2196C11.9478 17.1866 11.6139 17.1531 11.2724 17.1277C11.3941 16.3916 11.5157 15.7099 11.6374 15.0282ZM13.1393 11.7903C12.8431 11.7617 12.5395 11.7323 12.2264 11.7132C12.4524 10.4535 12.6281 9.40809 12.829 8.2019C13.1109 8.29311 13.3929 8.37501 13.6718 8.45605C14.2126 8.61316 14.7423 8.76702 15.2392 8.97922C15.9673 9.30087 16.2686 9.97097 16.1431 10.6947C16.0175 11.3916 15.5154 11.8473 14.6869 11.8741C14.1859 11.8913 13.6745 11.8419 13.1393 11.7903Z" fill="#C0CCDA" />
                    </svg>
                    <svg width="75" height="21" viewBox="0 0 75 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.684082 2.60264C0.684082 1.18202 1.73856 0.109863 3.37048 0.109863C5.00241 0.109863 6.05688 1.12842 6.05688 2.52223C6.05688 3.99646 5.00241 5.09543 3.37048 5.09543C1.76366 5.09543 0.684082 4.02326 0.684082 2.60264ZM1.18621 6.56966H5.57986V19.9717H1.18621V6.56966Z" fill="#C0CCDA" />
                        <path d="M16.5012 19.4354C15.748 19.9447 14.5931 20.2127 13.4382 20.2127C10.2246 20.2127 8.34158 18.524 8.34158 15.0931V10.59H6.50879V7.07868H8.34158V3.59415H12.7352V7.07868H15.5974V10.59H12.7352V15.0395C12.7352 16.0313 13.2625 16.5673 14.0659 16.5673C14.5429 16.5673 15.0451 16.4065 15.3965 16.1385L16.5012 19.4354Z" fill="#C0CCDA" />
                        <path d="M30.9626 12.3055V19.9715H26.5689V13.0828C26.5689 11.1529 25.7906 10.3488 24.5102 10.3488C23.1042 10.3488 21.9995 11.287 21.9995 13.5117V19.9983H17.6058V6.59625H21.7986V8.04367C22.8029 6.94471 24.2089 6.35501 25.7906 6.35501C28.703 6.35501 30.9626 8.15089 30.9626 12.3055Z" fill="#C0CCDA" />
                        <path d="M32.5443 13.2437C32.5443 9.22305 35.532 6.35501 39.6244 6.35501C43.767 6.35501 46.7044 9.22305 46.7044 13.2437C46.7044 17.2911 43.767 20.1859 39.6244 20.1859C35.5069 20.1859 32.5443 17.3179 32.5443 13.2437ZM42.2606 13.2437C42.2606 11.2066 41.1308 10.0808 39.6244 10.0808C38.1431 10.0808 36.9882 11.2066 36.9882 13.2437C36.9882 15.3076 38.1431 16.4602 39.6244 16.4602C41.1308 16.4602 42.2606 15.3076 42.2606 13.2437Z" fill="#C0CCDA" />
                        <path d="M61.0151 6.56934L55.8432 19.9714H51.2989L46.127 6.56934H50.6461L53.6589 14.7446L56.8224 6.56934H61.0151Z" fill="#C0CCDA" />
                        <path d="M60.4377 13.2437C60.4377 9.22305 63.4254 6.35501 67.5178 6.35501C71.6604 6.35501 74.5979 9.22305 74.5979 13.2437C74.5979 17.2911 71.6604 20.1859 67.5178 20.1859C63.4254 20.1859 60.4377 17.3179 60.4377 13.2437ZM70.154 13.2437C70.154 11.2066 69.0242 10.0808 67.5178 10.0808C66.0365 10.0808 64.8816 11.2066 64.8816 13.2437C64.8816 15.3076 66.0365 16.4602 67.5178 16.4602C69.0242 16.4602 70.154 15.3076 70.154 13.2437Z" fill="#C0CCDA" />
                    </svg>
                    <div className="lineBitnovo"></div>
                    <p className="pBitnovoFooter">© 2022 Bitnovo. All rights reserved.</p>
                </div>
            </div>
        </div>
    )
}

export default Order;