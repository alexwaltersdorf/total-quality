/** Cada destino operacional deve ser tentado, mesmo se o outro falhar. */
export async function persistLead(
  saveDatabase: () => Promise<{ success: boolean }>,
  saveSheet: () => Promise<boolean>,
): Promise<{ success: true }> {
  const [database, sheet] = await Promise.allSettled([saveDatabase(), saveSheet()]);
  const databaseSaved = database.status === 'fulfilled' && database.value.success;
  const sheetSaved = sheet.status === 'fulfilled' && sheet.value;
  // Nunca registrar payload, contatos, credenciais ou mensagem bruta do driver.
  if (!databaseSaved) console.warn('[LeadCapture] Falha na persistencia no banco');
  if (!sheetSaved) console.warn('[LeadCapture] Planilha indisponivel ou nao configurada');
  if (!databaseSaved && !sheetSaved) {
    throw new Error('Nao foi possivel registrar o contato. Tente novamente.');
  }
  return { success: true };
}
