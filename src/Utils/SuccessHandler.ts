let SuccessHandler = (statusCode:number, data:any, message:string, res:any) => {
    return res.status(statusCode).json({
        status: true,
        code: statusCode,
        data,
        message,
    });
};

export default SuccessHandler;
