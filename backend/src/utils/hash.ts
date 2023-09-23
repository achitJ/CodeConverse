import bcrypt from 'bcryptjs';

export const hash = (password: string): string => {
    const salt = bcrypt.genSaltSync(8);
    return bcrypt.hashSync(password, salt);
}

export const compare = (password: string, hash: string): boolean => {
    return bcrypt.compareSync(password, hash);
}