import { registerDecorator, ValidationArguments,ValidationOptions } from "class-validator";



export function AtLeastOneField(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'AtLeastOneField',
            target: object.constructor,
            propertyName: '_atleastone',
            options: validationOptions,
            validator: {
                validate(args: ValidationArguments) {
                    const obj= args.object
                    return Object.values(obj).some(v => v !== undefined)
                },
                defaultMessage() {
                    return 'At least one field must be provided'
                }
            }
        })
    }
}