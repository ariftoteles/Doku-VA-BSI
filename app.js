require("dotenv").config();
const express = require("express");
const app = express();
const dokuLib = require("./dokuLib.js");
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	res.send("Connection OK");
});

app.post("/", async (req, res) => {
	let setupConfiguration = dokuLib.SetupConfiguration;
	setupConfiguration.environment = "sandbox";
	setupConfiguration.client_id = process.env.CLIENT_ID;
	setupConfiguration.merchant_name = "CUSO";
	setupConfiguration.shared_key = process.env.SECRET_KEY;
	setupConfiguration.serverLocation = dokuLib.getServerLocation(
		setupConfiguration.environment
	);
	setupConfiguration.channel = "bsi";

	let paymentCodeRequest = dokuLib.PaymentCodeRequestDto;
	paymentCodeRequest.customer.name = req.body.customer.name;
	paymentCodeRequest.customer.email = req.body.customer.email;
	paymentCodeRequest.order.invoice_number = req.body.order.invoice_number;
	paymentCodeRequest.order.amount = req.body.order.amount;
	paymentCodeRequest.virtual_account_info.reusable_status =
		req.body.virtual_account_info.reusable_status;
	paymentCodeRequest.virtual_account_info.expired_time =
		req.body.virtual_account_info.expired_time != null
			? req.body.virtual_account_info.expired_time
			: "";
	try {
		const response = await dokuLib.generateBSIVa(
			setupConfiguration,
			paymentCodeRequest
		);
		res.status(200).json(response);
	} catch (error) {
		res.status(error.response.status).json({
			message: error.message,
		});
	}
});

app.listen(PORT, () => {
	console.log("This app running on PORT: " + PORT);
});
