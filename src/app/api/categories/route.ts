import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;
    if (!name) {
      return NextResponse.json(
        { error: 'O nome da categoria é obrigatório' },
        { status: 400 }
      );
    }
    const newCategory = await prisma.category.create({
      data: { name },
    });
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Uma categoria com este nome já existe.' },
          { status: 409 }
        );
      }
    }
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json(
      { error: 'Não foi possível criar a categoria.' },
      { status: 500 }
    );
  }
}