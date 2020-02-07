module.exports = {
  errors: [],
  errorCount:0,
  addError(e){
    this.errors.push(e);
    this.errorCount++;
  },
  clear(){
    this.errors = [];
    this.errorCount = 0;
  }
}