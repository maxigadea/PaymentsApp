import { useEffect, useState } from "react";
import { useRouter } from 'next/router'
var axios = require('axios');


const Payment = () => {
  const router = useRouter();
  const [data, setData] = useState({
    importe: '',
    concepto: '',
    fiat: "EUR",
    date: Date(Date.now()),
    currencySelected: '',
    showCurrency: false,
    currencys: []
  });


  useEffect(() => {
    getCurrencys();
  }, []);

  const confirmPayment = () => {
    var dataToSend = JSON.stringify({
      "expected_output_amount": Number(data.importe),
      "input_currency": data.currencySelected,
      "merchant_urlok": "https://bitnovo.com/ok", 
      "merchant_urlko": "https://bitnovo.com/ko",   
      "notes": data.concepto
    });

    var config = {
      method: 'post',
      url: 'https://payments.smsdata.com/api/v1/orders/',
      headers: {
        'X-Merchant-Id': process.env.NEXT_PUBLIC_MERCHANTID  , 
        'Content-Type': 'application/json'
      },
      data: dataToSend
    };

    axios(config)
      .then(function (response) {
        router.push(`/order/${response.data.identifier}`);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const getCurrencys = () => {
    var config = {
      method: 'get',
      url: 'https://payments.smsdata.com/api/v1/currencies',
      headers: {
        'X-Merchant-Id': process.env.NEXT_PUBLIC_MERCHANTID  
      }
    };
    axios(config)
      .then(function (response) {
        setData({ 
          ...data,
          currencys: response.data
        })
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setData({
      ...data,
      showCurrency: true
    })
  };

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.name === "importe" ? e.target.value.replace(',', '.') : e.target.value,
    })
  };

  const onSelectChange = (e) => {
    setData({
      ...data,
      currencySelected: e.target.value
    })
  };


  if (data.showCurrency) {
    return (
      <div className="containerGeneral">
        <div className="containerOne">
          <h2 className="titleResumen">Resumen del pedido</h2>
          <div className="containerResumen">
            <div className="containerItems">
              <div className="containerItemOne">
                <div className="itemOne">
                  <p className="pImporte"> Importe: </p>
                  <p className="pCurrency"> {data.importe} EUR</p>
                  <div className="line"></div>
                </div>
              </div>
              <div className="containerItemTwo">
                <div className="itemTwo">
                  <div className="containerComercio">
                    <p className="pComercioOne"> Comercio:</p>
                    <p className="pComercioTwo"> La Tiendita Crypto</p>
                  </div>
                  <div>
                    <p className="fechaOne"> Fecha:</p>
                    <p className="pfechaTwo">{data.date.toString().substr(0, 24)}</p>
                  </div>
                  <div className="lineTwo"></div>
                </div>
              </div>
              <div className="containerConcepto">
                <p className="pConcepto">Concepto</p>
                <p className="pConceptoTwo">{data.concepto}</p>
              </div>
              <button onClick={confirmPayment} disabled={!data.importe || !data.concepto || !data.currencySelected} className="rounded-primary flex-col-hcenter-vcenter clip-contents">
                <div className="frame-12275 flex-row-vcenter-hcenter">
                  <span className="txt-620 flex-hcenter">Confirmar pago</span>
                </div>
              </button>
            </div>
          </div>
        </div>
        <div className="containerTwo">
          <div className="containerHeaderSelect">
            <p className="pTitleSelect">Seleccionar Moneda</p>
            <div className="containerSelect">
              <div >
                <div className="alignSelectedText">
                  <select onChange={(e) => onSelectChange(e)} defaultValue="Selecciona la moneda" className="rectangleSelect">
                  <option value="Selecciona la moneda" disabled="disabled">Selecciona la moneda</option>
                    {
                      data.currencys ? data.currencys.map((currency, i) => {
                        return (
                          <option disabled={currency.min_amount > data.importe} key={i} value={currency.blockchain}>{currency.name}</option>
                        )
                      }) : ""
                    }
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div>
          </div>
        </div>
      </div>
    )
  };

  return (
    <div className="containerPayments">
      <form onSubmit={(e) => handleSubmit(e)} className="frame-122319 flex-col-hstart-vstart">
        <div className="frame-122318 flex-col-hstart-vstart">
          <h1 className="paymentsTitle">Crear pago</h1>
          <div className="frame-122317 flex-col-hstart-vstart">
            <div className="frame-122315 flex-row-vstart-hstart">
              <label className="txt-517">Importe a pagar</label>
            </div>
            <div className="input flex-row-vstart-hstart">
              <input name="importe" value={data.importe} placeholder='56,06 EUR' onChange={(e) => handleChange(e)} className="txt-949" min="0.1"></input>
            </div>
          </div>
          <div className="frame-122316 flex-col-hstart-vstart">
            <div className="frame-122315 flex-row-vstart-hstart">
              <label className="txt-517">Concepto</label>
            </div>
            <div className="input flex-row-vstart-hstart">
              <input name="concepto" value={data.concepto} placeholder='Compra de XXXXX' onChange={(e) => handleChange(e)} className="txt-949"></input>
            </div>
          </div>
        </div>
        <button disabled={!data.importe || !data.concepto} type="submit" className="rounded-primary flex-col-hcenter-vcenter clip-contents">
          <div className="frame-12275 flex-row-vcenter-hcenter">
            <span className="txt-620 flex-hcenter">Crear pago</span>
          </div>
        </button>
      </form>
    </div>
  )
}

export default Payment;