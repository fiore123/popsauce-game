import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl, answers, categoryId } = body;

    if (!imageUrl || !answers || !categoryId) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: 'answers deve ser uma lista com pelo menos uma resposta' },
        { status: 400 }
      );
    }
    
    const newQuestion = await prisma.question.create({
      data: {
        imageUrl,
        answers: JSON.stringify(answers),
        categoryId: Number(categoryId),
      },
    });
    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar a pergunta:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        category: true,
      },
    });
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}