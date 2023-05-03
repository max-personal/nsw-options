import { AbstractControl, ValidationErrors } from "@angular/forms";

export class yearVal {
    static yearValidator(control: AbstractControl): ValidationErrors | null {
        let controlValue = control.value as number;
            if (controlValue > 2022 || controlValue < 1998 || controlValue % 1 != 0) {
                return { yearValidator: true }
            }
            return null;
    }
}