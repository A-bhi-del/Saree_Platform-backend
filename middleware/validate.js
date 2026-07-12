const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors: result.error.issues,
      });
    }

    Object.assign(req[source], result.data);

    next();
  };
};

export default validate;