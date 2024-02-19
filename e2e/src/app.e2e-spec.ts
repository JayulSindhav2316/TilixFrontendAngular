import {PoseidonPage} from './app.po';

describe('Poseidon App', () => {
    let page: PoseidonPage;

    beforeEach(() => {
        page = new PoseidonPage();
    });

    it('should display welcome message', () => {
        page.navigateTo();
        expect(page.getTitleText()).toEqual('Welcome to Poseidon!');
    });
});
