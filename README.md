# PaymentsApp
Aplicación de pagos con crypto: Nextjs, EthersJs, Metamask, QR, BitnovoAPI.


//// - TO DO -  

*Modularizar Componentes y mover el css global a archivos en css Module o Style Components.
*Implementar la lógica del timer

Prueba técnica
El desarrollo consiste en crear una pasarela de pago con criptodivisas. Esta se va a realizar
en un entorno de testnet. Toda la documentación de los endpoints y los contratos de las
criptodivisas de testnet la podemos encontrar aquí. Hay que desarrollar principalmente dos
pantallas, una para crear el pago y la otra para realizar el pago. La información sobre cada
pantalla la tenemos a continuación:
1- Crear pago
El Merchant deberá poder crear un pago añadiendo el importe, concepto y criptodivisa.
Para crear el pago se hará uso del endpoint POST orders y para listar las criptodivisas
disponibles se hará con el endpoint GET currencies. Los 3 campos mencionados
anteriormente deberán introducirse en una misma pantalla y las criptodivisas que se podrán
seleccionar variarán en función del importe del pago.
2- Pasarela de pago QR
Una vez el pago esté creado debemos mostrar todos los datos del resumen del pago y la
información para que el Cliente pueda realizarlo. Todos estos datos los podemos obtener
haciendo uso del endpoint GET orders/info. Hay que tener en cuenta que los pagos tienen
un tiempo de expiración y que debe llevarnos a una pantalla KO si caduca (estado “EX” o
“OC”). En cambio, si el pago se realiza correctamente (estado “CO” o “AC”), nos llevará a
una pantalla OK. Se valora muy positivamente la opción de añadir mediante Web3 alguna
wallet, como puede ser METAMASK.
Importante: la pasarela de pago debe refrescarse en tiempo real, es decir, si se recibe un
pago la pantalla se debe refrescar de forma automática. Al crear un pago, se crea un
websocket el cual se puede escuchar para recibir notificaciones de cambio de estado.
Ejemplo de websocket:
const socket = new WebSocket('wss://payments.smsdata.com/ws/<identifier>');
Simplemente habría que añadir en cada caso el identifier que devuelve el endpoint al crear
un pago.
