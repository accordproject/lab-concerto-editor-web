/**
 * Writer buffers text to be written in memory. It handles simple
 * indentation and tracks the number of lines written.
 * @private
 * @class
 * @memberof module:concerto-util
 */
class Writer {

    beforeBuffer: any
    buffer: any
    linesWritten: any
    filenameToContent: Record<string, string>
    /**
     * Create a Writer.
     */
    constructor() {
        this.filenameToContent = {}
        this.beforeBuffer = '';
        this.buffer = '';
        this.linesWritten = 0;
    }

    /**
     * Writes text to the start of the buffer
     * @param {number} tabs - the number of tabs to use
     * @param {string} text - the text to write
     */
    writeBeforeLine(tabs: number, text: string) {
        for(let n=0; n < tabs; n++) {
            this.beforeBuffer += '   ';
        }
        this.beforeBuffer += text;
        this.beforeBuffer += '\n';
        this.linesWritten++;
    }

    /**
     * Append text to the buffer
     * @param {number} tabs - the number of tabs to use
     * @param {string} text - the text to write
     */
    writeLine(tabs: number, text: string) {
        for(let n=0; n < tabs; n++) {
            this.write('   ');
        }
        this.write(text);
        this.write('\n');
        this.linesWritten++;
    }

    /**
     * Returns the number of lines that have been written to the buffer.
     * @return {number} the number of lines written to the buffer.
     */
    getLineCount() {
        return this.linesWritten;
    }


    /**
     * Append text to the buffer, prepending tabs
     * @param {number} tabs - the number of tabs to use
     * @param {string} text - the text to write
     */
    writeIndented(tabs: number,text: string) {
        for(let n=0; n < tabs; n++) {
            this.write('   ');
        }
        this.write(text);
    }

    /**
     * Append text to the buffer (no automatic newline). The
     * text may contain newline, and these will increment the linesWritten
     * counter.
     * @param {string} msg - the text to write
     */
    write(msg: string) {
        if(typeof msg !== 'string' ) {
            throw new Error('Can only append strings. Argument ' + msg + ' has type ' + typeof msg);
        }

        this.buffer += msg;
        this.linesWritten += msg.split(/\r\n|\r|\n/).length;
    }

    /**
     * Returns the text that has been buffered in this Writer.
     * @return {string} the buffered text.
     */
    getBuffer() {
        return this.beforeBuffer + this.buffer;
    }

    /**
     * Empties the underyling buffer and resets the line count.
     */
    clearBuffer() {
        this.beforeBuffer = '';
        this.buffer = '';
        this.linesWritten = 0;
    }
}

/**
 * FileWriter creates text files under a directory tree. It can be used
 * by code generators to create source files for example.
 * Basic usage is: openFile(fileName), writeLine(...), closeFile().
 *
 * @private
 * @extends Writer
 * @see See {@link Writer}
 * @class
 * @memberof module:concerto-core
 */
export default class FileWriter extends Writer {

    outputDirectory: any
    relativeDir: any
    fileName: any

    /**
     * Create a FileWriter.
     *
     * @param {string} outputDirectory - the path to an output directory
     * that will be used to store generated files.
     */
    constructor(outputDirectory: string) {
        super();
        this.outputDirectory = outputDirectory;
        this.relativeDir = null;
        this.fileName = null;
    }

    /**
     * Opens a file for writing. The file will be created in the
     * root directory of this FileWriter.
     *
     * @param {string} fileName - the name of the file to open
     */
    openFile(fileName: string) {
        this.fileName = fileName;
        this.relativeDir = null;
    }

    /**
     * Opens a file for writing, with a location relative to the
     * root directory of this FileWriter.
     *
     * @param {string} relativeDir - the relative directory to use
     * @param {string} fileName - the name of the file to open
     */
    openRelativeFile(relativeDir: string, fileName: string) {
        this.relativeDir = relativeDir;
        this.fileName = fileName;
    }

    /**
     * Writes text to the current open file
     * @param {int} tabs - the number of tabs to use
     * @param {string} text - the text to write
     */
    writeLine(tabs: number,text:string) {
        if (this.fileName) {
            super.writeLine(tabs,text);
        } else {
            throw Error('File has not been opened!');
        }
    }

    /**
     * Writes text to the start of the current open file
     * @param {int} tabs - the number of tabs to use
     * @param {string} text - the text to write
     */
    writeBeforeLine(tabs: number,text: string) {
        if (this.fileName) {
            super.writeBeforeLine(tabs,text);
        } else {
            throw Error('File has not been opened!');
        }
    }

    /**
     * Closes the current open file
     */
    closeFile() {
        if (!this.fileName) {
            throw new Error('No file open');
        }        
        this.filenameToContent[this.fileName] = this.getBuffer();

        this.fileName = null;
        this.relativeDir = null;
        this.clearBuffer();
    }
}