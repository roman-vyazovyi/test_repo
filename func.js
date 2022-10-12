const fdk = require('@fnproject/fdk');

const sendSMS = async (input, ctx) => {

    const isTwilio = isTwilioInput(input);
    if (!isTwilio.error) {
        const { token, login, dst_phone, src_phone, message } = isTwilio;

        try {
            const client = require('twilio')(login, token);
            const result = await client.messages.create({
                body: message,
                from: src_phone,
                to: dst_phone
            });

            if (!result) {
                return setStatus({
                    error: 'Cannot send message'
                }, ctx);
            }

            if (result.errorCode) {
                return setStatus({
                    error: result.errorMessage,
                    status: 500
                }, ctx);
            }

            return setStatus({
                status: 200
            }, ctx);

        } catch (error) {
            return setStatus({
                error: error.toString(),
                status: 500
            }, ctx);
        }

    }

    return setStatus(isTwilio, ctx);
}


const isTwilioInput = (input) => {
    const { dst_phone, src_phone, message, auth_info } = input;

    if (!auth_info) {
        return {
            error: 'Auth info is not provided to SMS Adapter.',
            status: 401
        };
    }

    const { login, token, password } = auth_info;

    if (!token) {
        return {
            error: 'Twilio token is not provided to SMS Adapter.',
            status: 401
        };
    }

    if (!login) {
        return {
            error: 'Login is not provided to SMS Adapter. Login should contain twilio account SID.',
            status: 401
        };
    }

    if (!dst_phone) {
        return {
            error: 'Destination phone is not provided to SMS Adapter.',
            status: 400
        };
    }

    if (!src_phone) {
        return {
            error: 'Source phone is not provided to SMS Adapter. This should be twilio phone number, taken from personal account info.',
            status: 400
        };
    }

    if (!message) {
        return {
            error: 'Message is not provided to SMS Adapter.',
            status: 400
        };
    }

    return {
        token, login, dst_phone, src_phone, message
    };
}


const setStatus = (result, ctx) => {
    return result;
    const gateway = ctx.httpGateway;

    if(result.error) {
        gateway.setStatus = result.status || 400;
        result.success = false;
    }
    else {
        gateway.setStatus = result.status || 200;
        result.success = true;
    }

    return result;
}


fdk.handle(sendSMS);
