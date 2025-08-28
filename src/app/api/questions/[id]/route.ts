import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const { imageUrl, answers, categoryId } = body;

    if (!imageUrl || !answers || !categoryId) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: 'answers deve ser uma lista com pelo menos uma resposta' },
        { status: 400 }
      );
    }

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        imageUrl,
        answers: JSON.stringify(answers),
        categoryId: Number(categoryId),
      },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error(`Erro ao atualizar pergunta ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    const deletedQuestion = await prisma.question.delete({
      where: { id },
    });

    return NextResponse.json(deletedQuestion);
  } catch (error) {
    console.error(`Erro ao deletar pergunta ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}