-- Fix existing rows that have NULL estado after adding the new column
UPDATE cuenta SET estado = true WHERE estado IS NULL;
