import { prisma } from '../config/database.js';
import { type IUser } from '../interfaces/user.interface.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
 
  static async registerUser(userData: IUser) {
    const { name, email, password } = userData;

    
    const userExist = await prisma.user.findUnique({
      where: { email }
    });

    if (userExist) {
      throw new Error('El correo electrónico ya está registrado.');
    }

    
    const hashedPassword = await bcrypt.hash(password!, 10);

    
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userData.role || 'CLIENTE'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    return newUser;
  }

  
  static async loginUser(email: string, passwordAttempt: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Credenciales inválidas.');
    }

    
    const isPasswordValid = await bcrypt.compare(passwordAttempt, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas.');
    }

    
    const secret = process.env.JWT_SECRET || 'secreto_por_defecto';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '1m' }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }
}