**API-GATEWAY explanation:**

You are seeing our API between the clients and our microservices.

> The API-Gateway keeps safe the connection with public routes and private routes and have
controllers to handle with each necessity, calling microservices, or rendering the webpage
to send to the client.

**API-Gateway functions**

> **PUBLIC ROUTES**

**getIcon:** To get the favicon.ico. Many browsers askes for it.

**homePage:** Returns our main page.

**login:** Returns the login page.

**register:** Returns the register page.

**checkRegister:** Check with the register is all right.

**checkLogin:** Check if the login is a valid one.

**forgotPasswordPage:** Returns the public forgot password page

**checkEmail:** That is a public route that helps the forgotPasswordPage to check if you have send a code to validate if the user have access to the e-mail mentioned.

**validateEmailCode:** To check if the user really got the code from the e-mail mentioned. That is the first step, when the user type the code.

**checkEmailCode:** To check the code the user sent

**changePassword:** Allow the user to change the password if that user followed all steps before it correctly

**newPassword:** Public route to change password with security of each step

**hello:** test connection with auth-service connection

**checkDb:** test connection with database from api-gateway
