// final-test-new-credentials.js
import axios from "axios";

const finalTest = async () => {
  const password = "Test2026";
  const securityToken = "exkkDJLmAUI7hRdhraawn4wW";
  const fullPassword = password + securityToken;

  console.log("🎯 Финальный тест с новыми данными:");
  console.log("Username: kuzma-inoverolga@resourceful-hawk-143ef2.com");
  console.log("Password: Test2026");
  console.log("Security Token: exkkDJLmAUI7hRdhraawn4wW");
  console.log("Полный пароль: Test2026exkkDJLmAUI7hRdhraawn4wW");
  console.log("Общая длина:", fullPassword.length);

  try {
    const response = await axios.post(
      "https://login.salesforce.com/services/oauth2/token",
      new URLSearchParams({
        grant_type: "password",
        client_id:
          "3MVG9WVXk15qiz1L0RHwgd8JG9tVWl8zGBL_HEHL_2uiarOZctTDRmjg7PhiOb7WhGulc0zgyEivpWlNZYgxP",
        client_secret:
          "926A5184D044D4A82E90D32A0CD526E9CC282D42DD9865BC871BDB88BB11D656",
        username: "kuzma-inoverolga@resourceful-hawk-143ef2.com",
        password: fullPassword,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 15000,
      }
    );

    console.log("✅ УСПЕХ! Токен получен!");
    console.log(
      "Access Token:",
      response.data.access_token.substring(0, 50) + "..."
    );
    console.log("Instance URL:", response.data.instance_url);
    console.log("🎉 ИНТЕГРАЦИЯ РАБОТАЕТ!");
  } catch (error) {
    console.log("❌ Ошибка:", error.response?.data);
  }
};

finalTest();
