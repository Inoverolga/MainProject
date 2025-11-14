import express from "express";
import { checkToken } from "../middleware/checkToken.js";
import axios from "axios";

const routerSalesforce = express.Router();

const getSalesforceToken = async () => {
  try {
    const response = await axios.post(
      "https://login.salesforce.com/services/oauth2/token",
      new URLSearchParams({
        grant_type: "password",
        client_id: process.env.SALESFORCE_CLIENT_ID,
        client_secret: process.env.SALESFORCE_CLIENT_SECRET,
        username: process.env.SALESFORCE_USERNAME,
        password:
          process.env.SALESFORCE_PASSWORD +
          process.env.SALESFORCE_SECURITY_TOKEN,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 15000,
      }
    );

    return {
      accessToken: response.data.access_token,
      instanceUrl: response.data.instance_url,
    };
  } catch (error) {
    console.error(
      "❌ Ошибка получения токена Salesforce:",
      error.response?.data
    );
    throw new Error("Не удалось подключиться к Salesforce");
  }
};

routerSalesforce.post("/create-account", checkToken, async (req, res) => {
  try {
    const formData = req.body;

    const { accessToken, instanceUrl } = await getSalesforceToken();

    const apiConfig = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    const accountResponse = await axios.post(
      `${instanceUrl}/services/data/v58.0/sobjects/Account`,
      {
        Name: formData.companyName,
        Industry: formData.industry || null,
        Phone: formData.phone || null,
        Website: formData.website || null,
        Description: formData.description || null,
        Type: "Customer",
      },
      apiConfig
    );

    const userName = formData.userName || formData.jobTitle || "Клиент";
    const nameParts = userName.trim().split(" ");
    const userEmail = formData.userEmail || req.user.email;

    const contactData = {
      FirstName: nameParts[0] || "",
      LastName: nameParts.slice(1).join(" ") || "Customer",
      Email: userEmail,
      Phone: formData.phone || null,
      Title: formData.jobTitle || null,
      Department: formData.department || null,
      AccountId: accountResponse.data.id,
    };

    const contactResponse = await axios.post(
      `${instanceUrl}/services/data/v58.0/sobjects/Contact`,
      contactData,
      apiConfig
    );

    return res.json({
      success: true,
      accountId: accountResponse.data.id,
      contactId: contactResponse.data.id,
      message: "Аккаунт и контакт успешно созданы в Salesforce",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error:
        error.response?.data || error.message || "Unknown Salesforce error",
    });
  }
});

export default routerSalesforce;
