
export class Example {
    private covered: boolean = false;
    /* Some code in here :) */

    public coverageTest() {
        /* Should be uncovered. */
        this.covered = true;
    }
}
