function loginWithProvider(loginProvider) {
    LogOut()
    localStorage.setItem("provider", loginProvider)
    window.location.replace('https://a.saal.ee/connect/' + loginProvider + '/')
}

async function GetCallback(providerToCall) {
    var requestOptions = {
        method: 'GET',
    }
    const response = await fetch('https://a.saal.ee/auth/' + providerToCall + '/callback' + location.search, requestOptions)
    // fetch('https://a.saal.ee/auth/' + providerToCall + '/callback' + location.search, requestOptions).then(function(response) {
    if (response.ok) {
        const data = await response.json()
        console.log(data);
        localStorage.setItem("ACCESS_TOKEN", data.jwt)
        localStorage.setItem("USER_PROFILE", JSON.stringify(data.user))
        localStorage.removeItem("provider")
        localStorage.setItem("initials", makeInitials(data.user))
        document.dispatchEvent(userProfileLoadedEvent)
        if (userProfile.blocked || !userProfile.confirmed) {
            accountStatus = false
        }
        validateToken()
    } else {
        var errorResponse = await response.json()
        var errors = []
        console.log("response: ", errorResponse)
        try {
            for (err of errorResponse.message) {
                for (messageId of err.messages) {
                    errors.push(messageId.id)
                }
            }
        } catch (err) {
            console.log(err)
        }

        try{
        errors.push(errorResponse.message.detail)
        }catch(err){
            console.log(err)

        }

        console.log("errors: ", errors)
        displayError(errors)
    }
}

const validateLogin = () => {
    var errors = []

    if (!validateEmail("logEmail"))errors.push('Missing or invalid email')
    if (logPsw && !validatePsw("logPsw"))errors.push('Missing or invalid password')

    // console.log(errors)
    if (errors.length === 0) {
        LoginWithEmail()
        console.log("valideerimine õnnestus saadan profiili Strapisse")
    } else {
        console.log(errors)
        displayError(errors)
    }
}

const LoginWithEmail = async() => {
    let email = document.getElementById("logEmail").value
    let psw = document.getElementById("logPsw").value

    let body = JSON.stringify({
        "identifier": email,
        "password": psw
    })

    let requestOptions = {
            'method': 'POST',
            'body': body,
            'headers': {
                'Content-Type': 'application/json'
            }
    }

    let response = await (await fetch('https://a.saal.ee/auth/local', requestOptions))

    if (response.ok) {
        const data = await response.json()
        localStorage.setItem("ACCESS_TOKEN", data.jwt)
        localStorage.setItem("USER_PROFILE", JSON.stringify(data.user))
        localStorage.setItem("initials", makeInitials(data.user))
        document.dispatchEvent(userProfileLoadedEvent)
        if (userProfile.blocked || !userProfile.confirmed) {
            accountStatus = false
        }
        validateToken()
    } else {
        var errorResponse = await response.json()
        var errors = []
        console.log("response: ", errorResponse)
        try {
            for (err of errorResponse.message) {
                for (message of err.messages) {
                    errors.push(message.message)
                }
            }
        } catch (err) {
            console.log(err)
        }
        console.log("errors: ", errors)
        displayError(errors)
    }

}

const validateRegForm = () => {

    var errors = []

    if (!validateEmail("regEmail")) {
        errors.push('Missing or invalid email')

    }
    if (regPsw && !validatePsw("regPsw")) {
        errors.push('Missing or invalid password')
    }

    if (regPswRepeat && !validatePswRep("regPsw", "regPswRepeat")) {
        errors.push('Missing or invalid password repeat')
    }

    // console.log(errors)
    if (errors.length === 0) {
        RegisterWithEmail()
        console.log("valideerimine õnnestus saadan profiili Strapisse")
    }else {
        console.log(errors)
        displayError(errors)
    }
}

const RegisterWithEmail = async () => {

    console.log("login sisse emaili ja salasõnaga")
    let email = document.getElementById("regEmail").value
    let psw = document.getElementById("regPsw").value

    let body = JSON.stringify({
        "username": email,
        "email": email,
        "password": psw
    })
    console.log("saadan body: ", body)

    let requestOptions = {
        'method': 'POST',
        'body': body,
        'headers': {
            'Content-Type': 'application/json'
        }
    }

    console.log(requestOptions)
    let response = await (fetch('https://a.saal.ee/auth/local/register', requestOptions))

    if (response.ok) {
        const data = await response.json()
        console.log(data)
    } else {
        var errorResponse = await response.json()
        var errors = []
        console.log("response: ", errorResponse)
        try {
            for (err of errorResponse.message) {
                for (message of err.messages) {
                    errors.push(message.message)
                }
            }
        } catch (err) {
            console.log(err)
        }

        console.log("errors: ", errors)
        displayError(errors)
    }

}

const ShowPswReset = () => {
    //alguses nähtaval
    document.getElementById("logPsw").classList.toggle("hidden")
    document.getElementById("sign-in-button").classList.toggle("hidden")
    document.getElementById("to-reset-psw").classList.toggle("hidden")
    document.getElementById("pswLabel").classList.toggle("hidden")
    //alguses peidus
    document.getElementById("psw-reset-button").classList.toggle("hidden")
    document.getElementById("back-to-login").classList.toggle("hidden")

}

const validatePswResetForm = () => {

    var errors = []

    if (!validateEmail("logEmail")) {
        errors.push('Missing or invalid email')

    }

    // console.log(errors)
    if (errors.length === 0) {
        SendPswResetLink()
        console.log("valideerimine õnnestus saadan päringu Strapisse")
    }else {
        console.log(errors)
        displayError(errors)
    }
}

const SendPswResetLink = async () => {
    console.log("lähtestan parooli")
    let email = document.getElementById("logEmail").value

    let body = JSON.stringify({
        "email": email
    })

    let requestOptions = {
        'method': 'POST',
        'body': body,
        'headers': {
            'Content-Type': 'application/json'
        }
    }

    console.log(requestOptions)
    let response = await (fetch('https://a.saal.ee/auth/forgot-password', requestOptions))

    if (response.ok) {
        const data = await response.json()
        console.log(data)
        console.log("email saadetud")
        document.getElementById("resetLinkSent").style.display = "block"
    } else {
        var errorResponse = await response.json()
        var errors = []
        console.log("response: ", errorResponse)
        try {
            for (err of errorResponse.message) {
                for (message of err.messages) {
                    errors.push(message.message)
                }
            }
        } catch (err) {
            console.log(err)
        }

        console.log("errors: ", errors)
        displayError(errors)
    }
}


function displayError(errArray){
    for (err of errArray){
        console.log("display", err)
        switch(err){
        case "Key (username)=(tapferm@gmail.com) already exists.":
            document.getElementById("userExists").style.display = "block"
        break
        case "Identifier or password invalid.":
            document.getElementById("invalidPsw").style.display = "block"
            console.log("error oli: ", err)
        break
        case "Email is already taken. Providers.":
            document.getElementById("userExistsProviders").style.display = "block"
            console.log("error oli: ", err)
        break
        case "Missing or invalid password":
            document.getElementById("invalidPsw").style.display = "block"
            console.log("error oli: ", err)
        break
        case "Missing or invalid email":
            document.getElementById("invalidEmail").style.display = "block"
            console.log("error oli: ", err)
        break
        case undefined:
            console.log("defineerimata: ", err)
        break
        default:
            document.getElementById("loginError").innerText = errArray
            document.getElementById("loginError").style.display = "block"
        }
    }
}
//"Missing or invalid email"
//Auth.advanced.allow_register => Register action is actualy not available.
//Auth.form.error.email.taken => Email is already taken.
if (localStorage.getItem("provider")) {
    GetCallback(localStorage.getItem("provider"))
}
const beautifyProviders = providers => {
    providers = providers.replace(/facebook|google/gi, x => { return x.replace(/^\w/, (c) => c.toUpperCase()) })
    providers = providers.replace(/,/g, ', ')
    providers = providers.replace('local', 'password')
    console.log(providers)
    return providers
}


const GetUserFavorites = async() => {
    console.log("getting user favorites");
    // if (validToken) {
    // } else {
    //     console.log("validToken väärtus on", validToken);
    // }
    let requestOptions = {
        method: "GET",
        headers: {
            Authorization: "Bearer " + localStorage.getItem("ACCESS_TOKEN"),
        },
    }
    let res = await fetch("https://a.saal.ee/performance/my", requestOptions)
    let data
    if (res.ok) {
        data = await res.json()
        console.log(data);
    } else {
        let errorResponse = await res.json()
        console.log("response: ", errorResponse)
    }
    // console.log(JSON.stringify(data))
    let locale = document.getElementById("locale").innerHTML
    document.getElementById("favo-block").style.display = "block"
    document.getElementById("no-favo").style.display = "none"
    for (favo of data){
        let oneFavo = document.getElementById("one-favo").cloneNode(true)
        let link = oneFavo.childNodes[0].firstChild.firstChild
        let name = oneFavo.childNodes[0].firstChild.firstChild.firstChild
        let artist = oneFavo.childNodes[0].firstChild.firstChild.childNodes[1]
        link.setAttribute("href",`performance/${favo.remote_id}`)
        name.innerHTML=favo[`name_${locale}`]
        artist.innerText=favo.artist
        oneFavo.style.display = "block"
        document.getElementById("my-favorites").appendChild(oneFavo)
    }

}

function showUserInfo() {
    try {
        console.log("showing user info")
        userProfile = JSON.parse(localStorage.getItem("USER_PROFILE"))
        email.innerHTML = userProfile.email
        if (userProfile.firstName) firstName.innerHTML = userProfile.firstName
        if (userProfile.lastName) lastName.innerHTML = userProfile.lastName
        if (userProfile.phoneNumber) phoneNr.innerHTML = userProfile.phoneNumber
        // if (userProfile.provider) providers.innerHTML = beautifyProviders(userProfile.provider)
        if (userProfile.Favorites){
            console.log("favod")
            GetUserFavorites()
        }
    } catch (err) {
        console.log(err)
    }
    document.getElementById("logged-in-box").style.display = "block"
    document.getElementById("not-logged-in-box").style.display = "none"
}

if(validToken){
    showUserInfo()
    document.getElementById("logged-in-box").style.display = "block"
    document.getElementById("not-logged-in-box").style.display = "none"
}else {
    console.log("pole sisse loginud")
}


document.addEventListener('userProfileLoaded', function(e) {
    console.log("listening to userProfile loaded event in login ")
    try{
        showUserInfo()
    }
    catch(err){
        console.log("error userProfileLoaded evendis: ",err)
    }
})




