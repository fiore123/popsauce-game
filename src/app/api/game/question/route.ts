import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  try {
    const whereClause: Prisma.QuestionWhereInput = {};
    if (category && category.toLowerCase() !== 'todas') {
      whereClause.category = {
        name: category,
      };
    }

    const questionCount = await prisma.question.count({ where: whereClause });
    if (questionCount === 0) {
      return NextResponse.json({ error: 'Nenhuma pergunta encontrada.' }, { status: 404 });
    }

    const skip = Math.floor(Math.random() * questionCount);
    const question = await prisma.question.findFirst({
      where: whereClause,
      skip: skip,
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('Erro ao buscar pergunta aleatória:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}