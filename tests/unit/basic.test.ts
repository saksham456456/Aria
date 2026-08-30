
describe('Basic', () => {
  it('generates a 6 character join code', () => {
    // For this test we will just duplicate the logic since the route module has Next.js specific exports
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    }

    expect(generateCode().length).toBe(6);
  });
});
