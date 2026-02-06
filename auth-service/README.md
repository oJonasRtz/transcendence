**AUTH-SERVICE: that service handles with the authentication part of this project**

> CONTROLLERS 

**tryLoginTheUser:** check if the user can login correctly.

**createUserToken:** if the user logged up correctly that route will be called to create a token to identify the user.

**checkRegister:** the checkRegister will answer if the registration is all done and communicates to the database.

**getCaptcha:** Get the captcha code.

**checkEmail:** check e-mail of the user to confirm if that e-mail is valid

**newPassword:** Update the password of the user

**get2FAQrCode:** get the 2FA validation

**get2FAEnable:** get if the user turned on the 2FA validation

**get2FASecret:** get the secret of 2FA validations

**get2FAValidate:** To see if the user validated or not the 2FA

**set2FAValidate:** set the status of 2FA validation

**set2FASecret:** set 2FA Secret of the user

**getAuthData:** Obtain auth data of the target user

**setAuthUsername:** set a new username for the target user

**setAuthNickname:** set a new nickname for the target user

**setAuthEmail:** set a new email for the target user

**setAuthPassword:** set a new password for the target user

**deleteUserAccount:** delete the user account

**hello:** Test connection with the service

**helloDb:** Test connection with database

> ROUTES

**authRoutes.js**: all the routes can be find here

> MODELS

**authModels.js**: all models can be find here
