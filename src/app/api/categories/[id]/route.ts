import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    await prisma.category.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Erro ao deletar categoria ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Erro ao deletar categoria' },
      { status: 500 }
    );
  }
}