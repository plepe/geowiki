/**
 * updates src properties by upd properties
 * src properties which are not in upd properties are kept unchanged
 * properties from upd will be included in src
 * properties from upd which are null will be removed from src
 * @param {object} src - Original properties (will not be changed by this function)
 * @param {object} upd - Values to update src
 * @return {object} - the updated object
 */
function update_properties(src, upd) {
  var ret = {};

  if((typeof src != 'undefined') && src)
    ret = JSON.parse(JSON.stringify(src));

  for(var k in upd) {
    if(upd[k] === null)
      delete(ret[k]);
    else
      ret[k] = upd[k];
  }

  return ret;
}
