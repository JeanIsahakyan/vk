var app = {
  init: function() {
    var _a = app;
    cur.blocks = ge('blocks'), 
    cur.header = ge('header_controls'), 
    cur.selector = ge('block_selector'),
    cur.blocks_header = ge('blocks_header'),
    cur.number = ge('blocks_number'),
    cur.editingMode = cur.mousedown = false, 
    cur.clipboard = [],
    cur.yCnt = cur.xCnt = 1, cur.shiftLeft = cur.shiftTop = cur.latestSelected = '',
    cur.selectedMultiMode = cur.selectedBlock = false;

    document.execCommand("enableObjectResizing", false, false);


    addEvent(document, 'keydown', function(e){
      switch(e.keyCode) {

        case KEY.ENTER:
        case KEY.DOWN:
        case KEY.UP:
         if (cur.selectedBlock) {
             cancelEvent(e);
            if(e.shiftKey && (e.keyCode == KEY.UP || e.keyCode  == KEY.DOWN)){
                _a.changeSelectorSizeByKey('top', e);
            }else{
              var block = cur.selectedBlock.split('_');
              if (KEY.UP == e.keyCode){
                  block[2]--;
                }else {
                  block[2]++;
                }

                block = block.join('_'),
                el = ge(block);
             if(el) _a.moveSelector(el);
           }
         }

         if(e.keyCode == KEY.ENTER && el)  _a.editBlock();

        break;
      
        case KEY.RIGHT:
        case KEY.LEFT: 
        case KEY.TAB: 
         if (cur.selectedBlock) {
           cancelEvent(e);
            if(e.shiftKey && (e.keyCode == KEY.LEFT || e.keyCode  == KEY.RIGHT)){
                _a.changeSelectorSizeByKey('left', e);
            }else{
              var block = cur.selectedBlock.split('_');
                if (KEY.LEFT == e.keyCode){
                    block[1]--;
                  }else {
                    block[1]++;
                  }

                  block = block.join('_'),
                  el = ge(block);
               if(el) _a.moveSelector(el);
            }
         }

        break;

        default: 
    
         if(e.ctrlKey && e.keyCode == 86) { // paste
          cancelEvent(e);
          
          if(cur.clipboard.length == 0) return;

          var block = ge(cur.selectedBlock);
          if(cur.clipboard.length == 1) {
            var paste = cur.clipboard[0], style = {
               color: paste.color,
               backgroundColor: paste.background
             };

             cur.selector.innerHTML = block.innerHTML = paste.content;
             setStyle(block, style);
             setStyle(cur.selector, style);
             _a.editBlock();

          }else {
            var left = 2, top = 1, bl = block.id.split('_'), left_id = bl[1],
            top_id = bl[2],firstTop = id[2];

            each(cur.clipboard, function(k,v){
                var style = {
                   color: v.color,
                   backgroundColor: v.background
                 };
                  
                 var id = v.id.split('_');

                 if( k != 0) {
                    if(left < id[1]) {
                       left = id[1];
                       left_id++;
                       top_id = bl[2];
                       top = firstTop;
                     }else{
                        top = id[2];
                        top_id++;
                     }
                }else firstTop = id[2];

                var _block = ge('block_'+left_id+'_'+top_id);

                 _block.innerHTML = v.content;
                 setStyle(_block, style);

                 if(k == 0){
                   cur.selector.innerHTML =  v.content;
                   setStyle(cur.selector, style);
                 }
              
            });

          }
         }else if(e.ctrlKey && ( e.keyCode == 67 || e.keyCode == 88))  { // copy - 67 / cut - 88
          
          cancelEvent(e);

          if(cur.selectedMultiMode){
              cur.clipboard = [], temp = '';
              
              each(geByClass('selected'), function(k,v){
                id = v.id;
                if(v.id == cur.selectedBlock){
                  v = cur.selector;
                  id = cur.selectedBlock;
                }

                var data = {
                      content: v.innerHTML,
                      color: getStyle(v, 'color'), 
                      background: getStyle(v, 'background-color'),
                      id: id
                };

                temp += v.innerHTML.trim();

                cur.clipboard.push(data);

                if(e.keyCode == 88){ // cut 

                  v.innerHTML = '';
                  
                  var style = {
                    color: '',
                    backgroundColor: ''
                  };

                  setStyle(v, style);
                }

              });

              if(temp.length == 0){
                cur.selectedMultiMode = false;
                cur.clipboard = [];
              }

          }else{ 
            var block = ge(cur.selectedBlock);

            if(cur.editingMode) {

              if(!block.innerHTML && cur.selector.innerHTML) block.innerHTML = cur.selector.innerHTML;

              if(getStyle(block,'color') == 'rgb(0, 0, 0)' && getStyle(cur.slector,'color') != 'rgb(0, 0, 0)') {
                setStyle(block, {
                  color: getStyle(cur.slector,'color')
                 })
              }

              if(getStyle(block,'background-color') == 'transparent' && getStyle(cur.selector, 'background-color') != 'transparent') {
                setStyle(block, {
                  backgroundColor: getStyle(cur.slector,'background-color')
                 })
              }
            }

            var data = {
                  content: block.innerHTML,
                  color: getStyle(block, 'color'), 
                  background: getStyle(block, 'background-color')
            };

            if(e.keyCode == 88){ // cut

              cur.selector.innerHTML = block.innerHTML = '';

              var style = {
                color: '',
                backgroundColor: ''
              };

              setStyle(block, style);
              setStyle(cur.seletor, style);
            }

            cur.clipboard = [];
            cur.clipboard[0] = data;

          }  
         }else if(!cur.editingMode){
           _a.editBlock();
         }
      }
    });

    addEvent(document, 'mousemove', function(e){
        if(cur.mousedown && e.buttons) {

          if(e.target.id == 'block_selector') e.target = ge(cur.selectedBlock);

          _a.changeSelectorSize(e.target);

        }
    });

    addEvent(cur.selector, 'dblclick', function(){
        _a.clearSelected();
        _a.editBlock();
    });

    addEvent(cur.selector, 'click', function(){
      _a.clearSelected();
    });
    addEvent(cur.selector, 'mousedown', function(e){
      cur.mousedown = true;
    });
    
    addEvent(cur.selector, 'mouseup', function(e){
      cur.mousedown = false;
    });

    _a.resizeWrap();
    _a.generateBlocks();
    _a.moveSelector(ge('block_2_1'));

    removeClass('background', 'disabled');
    addClass('color', 'disabled');
  },
  changeSelectorSizeByKey: function(t, e){
        var _a = app,
            left = (cur.shiftLeft || cur.selectedBlock).split('_'),
            top = (cur.shiftTop || cur.selectedBlock).split('_');

        if(t == 'left') {
          if(top[2] != left[2]) left[2] = top[2];
          
          if(e.keyCode  == KEY.RIGHT){
             left[1]++;
           }else{
              left[1]--;
           }
          
           cur.shiftLeft = left.join('_'), id = ge(cur.shiftLeft);
         }else {

          if(left[1] != top[1]) top[1] = left[1];
        
          if(e.keyCode  == KEY.DOWN){
             top[2]++;
           }else{
              top[2]--;
           }
          
           cur.shiftTop = top.join('_'), id = ge(cur.shiftTop);
         }
        
         if(id) _a.changeSelectorSize(id);
  },
  changeColor: function(color, background) {
    var block = ge(cur.selectedBlock), style = {
      background: '#' + background,
      color: '#' + color
    };
    setStyle(block, style);
    if(cur.editingMode) setStyle(cur.selector, style);
  },
  resizeWrap: function() {
    setStyle('blocks_wrap',{
      width: window.innerWidth + 'px',
      height: (window.innerHeight - (cur.header.offsetHeight || 40)) + 'px'
    });
  },
  changeSelectorSize: function(block){
    var _a = app, selBlock = ge(cur.selectedBlock);
    if(!cur.latestSelected) cur.latestSelected = cur.selectedBlock;

    if(block.id) {
      var sel = cur.latestSelected.split('_'), _cur = block.id.split('_'),start = cur.selectedBlock.split('_');

      _cur[1] = parseInt(_cur[1]),
      _cur[2] = parseInt(_cur[2]),

      sel[1] = parseInt(sel[1]),
      sel[2] = parseInt(sel[2]),

      start[1] = parseInt(start[1]),
      start[2] = parseInt(start[2]);



      if(start[1] <= _cur[1] && start[1] <= sel[1] || start[2] <= _cur[2] && start[2] <= sel[2]) {

        for (var i = start[1]; i <= _cur[1]; i++) {

            if(start[2] < _cur[2] && sel[2] < _cur[2]) {
              for (var i1 = start[2]; i1 <= _cur[2]; i1++) {
                addClass('block_' + i + '_'+ i1, 'selected');
                addClass('block_num_'+i1, 'active_block');
              }
            }

            if(start[2] > _cur[2] && sel[2] > _cur[2]) {
               for (var i1 = start[2]; i1 >= _cur[2]; i1--) {
                  addClass('block_' + i + '_'+ i1, 'selected');
                  addClass('block_num_'+i1, 'active_block');
                }
             }

             if(sel[2] > _cur[2] && start[2] < sel[2]) {
               for (var i1 = sel[2]; i1 > _cur[2]; i1--) {
                  if(i1 != start[2]){
                    removeClass('block_' + i + '_'+ i1, 'selected');
                    removeClass('block_num_'+i1, 'active_block');
                  }
                }
             }

             if(sel[2] < _cur[2] && start[2] > sel[2]) {
               for (var i1 = sel[2]; i1 < _cur[2]; i1++) {
                 if(i1 != start[2]){
                   removeClass('block_' + i + '_'+ i1, 'selected');
                   removeClass('block_num_'+i1, 'active_block');
                 }
                }
             }

          }

         for (var i = start[2]; i <= _cur[2]; i++) {

            if(start[1] < _cur[1] && sel[1] < _cur[1]) {
              for (var i1 = start[1]; i1 <= _cur[1]; i1++) {
                addClass('block_' + i1 + '_'+ i, 'selected');
                addClass('blocks_header_item_'+i1, 'active_block');
              }
            }

            if(start[1] > _cur[1] && sel[1] > _cur[1]) {
               for (var i1 = start[1]; i1 >= _cur[1]; i1--) {
                  addClass('block_' +  i1 + '_'+ i, 'selected');
                  addClass('blocks_header_item_'+i1, 'active_block');
                }
             }

             if(sel[1] > _cur[1] && start[1] < sel[1]) {
               for (var i1 = sel[1]; i1 > _cur[1]; i1--) {
                  if(i1 != start[1] ){
                    removeClass('blocks_header_item_'+i1, 'active_block');
                    removeClass('block_' + i1 + '_'+ i, 'selected');
                  }
                }
             }

             if(sel[1] < _cur[1] && start[1] > sel[1]) {
               for (var i1 = sel[1]; i1 < _cur[1]; i1++) {
                 if(i1 != start[1]){
                   removeClass('blocks_header_item_'+i1, 'active_block');
                   removeClass('block_' + i1 + '_'+ i, 'selected');
                 }
                }
             }

          }

       }
      

      if(start[1] >= _cur[1] && start[1] >= sel[1]  || start[2] >= _cur[2] && start[2] >= sel[2]) {
        for (var i = start[1]; i >= _cur[1]; i--) {
           
           if(start[2] >= _cur[2] && sel[2] >= _cur[2]) {
             for (var i1 = start[2]; i1 > _cur[2]; i1--) {
                addClass('block_' + i + '_'+ i1, 'selected');
                addClass('block_num_'+i1, 'active_block');
              }
            }

            if(start[2] <= _cur[2] && sel[2] <= _cur[2]){
              for (var i1 = start[2]; i1 <= _cur[2]; i1++) {
                addClass('block_' + i + '_'+ i1, 'selected');
                addClass('block_num_'+i1, 'active_block');
              }
            }

            if(sel[2] >= _cur[2] && start[2] <= sel[2]) {
             for (var i1 = sel[2]; i1 > _cur[2]; i1--) {
                if(i1 != start[2]){
                  removeClass('block_num_'+i1, 'active_block');
                  removeClass('block_' + i + '_'+ i1, 'selected');
                }
              }
           }

           if(sel[2] <= _cur[2] && start[2] >= sel[2]) {
             for (var i1 = sel[2]; i1 < _cur[2]; i1++) {
                if(i1 != start[2]){
                   removeClass('block_num_'+i1, 'active_block');
                   removeClass('block_' + i + '_'+ i1, 'selected');
                 }
              }
           }
        }


         for (var i = start[2]; i >= _cur[2]; i--) {
           
           if(start[1] >= _cur[1] && sel[1] >= _cur[1]) {
             for (var i1 = start[1]; i1 >= _cur[1]; i1--) {
                addClass('block_' +i1 + '_'+ i , 'selected');
                addClass('blocks_header_item_'+i1, 'active_block');

              }
            }

            if(start[1] <= _cur[1] && sel[1] <= _cur[1]){
              for (var i1 = start[1]; i1 <= _cur[1]; i1++) {
                addClass('block_' + i1 + '_'+ i, 'selected');
                addClass('blocks_header_item_'+i1, 'active_block');
              }
            }

            if(sel[1] >= _cur[1] && start[1] <= sel[1]) {
             for (var i1 = sel[1]; i1 > _cur[1]; i1--) {
                if(i1 != start[1]){
                   removeClass('blocks_header_item_'+i1, 'active_block');
                   removeClass('block_' + i1 + '_'+ i, 'selected');
                 }
              }
           }

           if(sel[1] <= _cur[1] && start[1] >= sel[1]) {
             for (var i1 = sel[1]; i1 < _cur[1]; i1++) {
                if(i1 != start[1]){
                   removeClass('block_' + i1 + '_'+ i, 'selected');
                   removeClass('blocks_header_item_'+i1, 'active_block');
                 }
              }
           }
        }

      }

      cur.latestSelected = block.id;
      cur.selectedMultiMode = true;
      cur.shiftLeft = cur.shiftTop = block.id;
      addClass('background', 'disabled');
      addClass('color', 'disabled');
    }

 
  },
  setColor: function(color, id){ // copied from dev.js
    var col = ge('dev_colorbox'+id);
    setStyle(col, {backgroundColor: color});
    var colInp = ge('widget_color'+id);

    function hex(x) {
      return ("0" + parseInt(x).toString(16)).slice(-2);
    }

    color = color.replace('rgb(','').replace(')','').replace(/ /g, '').split(',');

    var hex = [hex(color[0]), hex(color[1]), hex(color[2])];

    for(var i in hex) if (hex[i].length == 1) hex[i] = '0' + hex[i];

    val(colInp, hex.join('').toUpperCase());
  },
  updatePickerColors: function(){
    var _a = app,
       block = ge(cur.selectedBlock), 
       color = getStyle(block, 'color'), 
       background = getStyle(block, 'background-color');

       if(background == 'transparent') background = 'rgb(255, 255, 255)';

       _a.setColor(color, 1);
       _a.setColor(background, 2);
  },
  clearSelected: function(){
    each(geByClass('selected'), function(k, v){
      removeClass(v, 'selected');
    });
    cur.selectedMultiMode = false;
  },
  moveSelector: function(el) {
    var _a = app;

    if(el.id != cur.selectedBlock && cur.editingMode){
      ge(cur.selectedBlock).innerHTML = cur.selector.innerHTML;
      cur.selector.innerHTML = '';
      cur.selector.removeAttribute('contenteditable');
      cur.editingMode = false;

      setStyle(cur.selector, {
        backgroundColor: '',
        color: ''
      });

      removeClass(cur.selector, 'active');
     
      addClass('color', 'disabled');
    }

    removeClass('background', 'disabled');

    var left = el.offsetLeft, top = el.offsetTop;

    top -= (cur.blocks_header.offsetHeight - 24), 
    cur.yCnt = 1, cur.xCnt = 1,
    cur.selectedBlock = el.id,
    id = el.id.split('_');

    each(geByClass('block_num'), function(k,v){
      removeClass(v, 'active_block');
    });

    each(geByClass('blocks_header_item'), function(k,v){
      removeClass(v, 'active_block');
    });

    addClass('blocks_header_item_'+id[1], 'active_block');
    addClass('block_num_'+id[2], 'active_block');

    _a.updatePickerColors();
    _a.clearSelected();
   
    cur.shiftLeft = cur.shiftTop = '';
   
    setStyle(cur.selector, {
      transform: 'translateX('+left+'px) translateY(' +top+ 'px)',
      minWidth:  '100px',
      height: '20px'
    });

  },
  editBlock: function() {
     var selBlock = ge(cur.selectedBlock);
     cur.selector.setAttribute('contenteditable', '');
     cur.editingMode = true;
     addClass(cur.selector, 'active');
     cur.selector.innerHTML = selBlock.innerHTML;
     setStyle(cur.selector,{
        backgroundColor: getStyle(selBlock,'background-color'),
        color: getStyle(selBlock,'color')
     });
     removeClass('color', 'disabled');
     addClass('background', 'disabled');
     selBlock.innerHTML = '';
     cur.selector.focus();
    
     if(document.createRange) {
        range = document.createRange();
        range.selectNodeContents(cur.selector);
        range.collapse(false);
        selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
  },
  generateBlocksSection: function(section, count, from) {
     var _a = app, section_block =  ce('div',{
      id: 'block_section_'+section,
      className: 'block_section'
     });


     cur.blocks.appendChild(section_block);

     if(!count) count = 100;
     if(!from) from = 1;
     for (var i = 1; i <= count; i++) {

      var block = ce('div',{
        id: 'block_' + section + '_' + i,
        className: 'block'
      });
    
      addEvent(block, 'dblclick', function(e){
       cancelEvent(e);
        _a.moveSelector(e.target);
        _a.editBlock();
      });

      addEvent(block, 'mousedown', function(e){
        _a.moveSelector(e.target);
        cur.selectedId = e.target.id;
        cur.mousedown = true;
      });

      addEvent(block, 'mouseup', function(e){
        cur.mousedown = false;
      });

      section_block.appendChild(block);
    }
  },
  generateBlocks: function() {
     var _a = app, alphabet = 'abcdefghijklmnopqrstuvwxyz'.split(''),len = 1, count = 100;
      
      each(alphabet, function(k,v){
        len++;
        _a.generateBlocksSection(len, count);

        cur.blocks_header.appendChild(ce('div',{
          className: 'blocks_header_item',
          innerHTML: v.toUpperCase(),
          id: 'blocks_header_item_' +  len
        }));
      });

      for(var i = 1; i <= count; i++){
          cur.number.appendChild(ce('div',{
            id: 'block_num_' + i,
            className: 'block_num',
            innerHTML: i
          }));

      }
      var style = {width: ((len * 100) - 48) + 'px'};

      setStyle(cur.blocks_header, style);

      style.height = (count * 22) + 'px';

      setStyle(cur.blocks, style);
    }


}