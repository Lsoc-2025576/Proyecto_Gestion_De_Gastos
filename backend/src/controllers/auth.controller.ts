import { type Request, type Response } from 'express';
import { AuthService } from '../services/auth.services.js';
import { type AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
      }

      const newUser = await AuthService.registerUser({ name, email, password });
      return res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: newUser,
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Error en el servidor' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
      }

      const data = await AuthService.loginUser(email, password);

      res.cookie('token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: 'Inicio de sesión exitoso',
        user: data.user,
      });
    } catch (error: any) {
      return res.status(401).json({ message: error.message || 'Error de autenticación' });
    }
  }

  static logout(req: Request, res: Response) {
    res.clearCookie('token');
    return res.status(200).json({ message: 'Sesión cerrada' });
  }

  static async me(req: AuthenticatedRequest, res: Response) {
    return res.status(200).json({ user: req.user });
  }
}