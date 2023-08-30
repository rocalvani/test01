export const generateUserErrorInfo = (user) =>{
    return "One or more properties were incomplete or invalid."
}

export const generateLogInErrorInfo = () =>{
    return "This user doesn't exist in the database."
}

export const generateDuplicateErrorInfo = () =>{
    return "This email or username is already in use by another user."
}