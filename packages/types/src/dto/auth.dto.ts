import { z } from 'zod';

export const RegisterSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres').max(128),
    name: z.string().min(2).max(100).optional(),
    organizationName: z.string().min(2, 'Nombre de organización requerido').max(100),
    referralCode: z.string().optional(),
});

export type RegisterDTO = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Contraseña requerida'),
});

export type LoginDTO = z.infer<typeof LoginSchema>;
