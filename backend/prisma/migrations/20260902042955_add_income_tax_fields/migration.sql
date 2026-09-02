-- CreateEnum
CREATE TYPE "IncomeType" AS ENUM ('FIJO', 'VARIADO');

-- CreateEnum
CREATE TYPE "IncomeClassification" AS ENUM ('SUELDO', 'CAPITAL', 'SERVICIO_FACTURADO', 'VENTA_ACTIVO');

-- CreateEnum
CREATE TYPE "IncomeRegime" AS ENUM ('PEQUENO_CONTRIBUYENTE', 'OPCIONAL_SIMPLIFICADO');

-- CreateTable
CREATE TABLE "incomes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "IncomeType" NOT NULL DEFAULT 'FIJO',
    "classification" "IncomeClassification" NOT NULL DEFAULT 'SUELDO',
    "regime" "IncomeRegime",
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "incomes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
