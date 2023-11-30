import { handleResponse, handleError } from "./ResponseService";
import aes256 from "./aes256";

export const get = (url, header) => {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'GET',
            headers: {
                "content-type": "application/json",
                ...header
            },
        })
            .then(response => response.json())
            .then(handleResponse)
            .then(resolve)
            .catch(reject)
            .catch(handleError);
    });
}

export const post = (url, data, header) => {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'POST',
            headers: {
                "content-type": "application/json",
                ...header
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(handleResponse)
            .then(resolve)
            .catch(reject)
            .catch(handleError);
    });
}

export const encrtypedPost = (url, data, header) => {
    const finalData = {encryptData: aes256.encrypt(JSON.stringify(data))}
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'POST',
            headers: {
                "content-type": "application/json",
                ...header
            },
            body: JSON.stringify(finalData)
        })
            .then(response => response.json())
            .then(handleResponse)
            .then(resolve)
            .catch(reject)
            .catch(handleError);
    });
}
