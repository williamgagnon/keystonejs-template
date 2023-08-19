import { expect } from 'chai';
import { setupSimpleTests } from './utils/test-builder';

describe('Simple tests example', function () {
  before(async function () {
    setupSimpleTests();
  });

  it('Simple test', async function () {
    const greeting = 'Hello world !';
    expect(greeting).to.have.length(13);
  });
});
