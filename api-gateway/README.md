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

> **PRIVATE_ROUTES**

**goFlappyBird:** goFlappyBird is a private route to call the Flappy Bird game

**goPong:** goPong is a private route to call the Pong game

**match:** that is the route to match players to a multiplayer game

**joinQueue:** to make someone starts to wait in a queue to play a game

**leaveQueue:** when the game starts or someone give up to play a game that function must be called to leave the player from the queue

**helloDb:** Test connection with database by a private route using an allowed microservice as auth-service to do it

**getHomePage:** Returns the user's homePage

**logout:** Logout the user

**confirmUserEmail:** this is the private route that allows the user to confirm the e-mail

**confirmUserEmailCode:** To get the code sent to the mail box from the user

**validateUserEmailCode:** to confirm the e-mail in the database when the confirmUserEmailCode allows it.

**get2FAQrCode:** generate or not the 2FA page qrcode. That routes can redirect the user to handle with 2FA protection.

**check2FAQrCode:** to check if the user sent correctly the code from 2FA protection.

**validate2FAQrCode:** to validate the 2FA if everything was done correctly.

**upload:** Upload an avatar.

**changeUsername:** Returns change username's page.

**changeNickname:** Returns change nickname's page.

**changeEmail:** Returns change email's page.

**changeDescription:** Returns change description's page.

**changePassword:** Returns change password's page.

**setUserDescription:** set the new description.

**setAuthPassword:** set the new password.

**setAuthEmail:** set the new e-mail.

**setAuthNickname:** set the new nickname.

**setAuthUsername:** set the new username.

**seeAllUsers:** returns the page seeAllUsers.

**seeProfile:** See the public profile of the target user mentioned by the public_id

**chatAllUsers:** Open the public chat.

**deleteUserAccount:** the user can delete their account.

**blockTheUser:** A person can block their other.

**friendInvite:** Send an invitation to become a friend.

**handlerFriendsPage:** You can see here who are you friends and to see about pendencies for confirmate them.

**setAcceptFriend:** You can accept as a friend the pendencie

**deleteAFriend:** You can delete a friend

**directMessage:** You can send a direct message by this route
