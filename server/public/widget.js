(function(){var e,t,n,r,i,a,o,s,c,l,u,d,f,p,m={},h=[],g=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,_=Array.isArray;function v(e,t){for(var n in t)e[n]=t[n];return e}function y(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function b(t,n,r){var i,a,o,s={};for(o in n)o==`key`?i=n[o]:o==`ref`?a=n[o]:s[o]=n[o];if(arguments.length>2&&(s.children=arguments.length>3?e.call(arguments,2):r),typeof t==`function`&&t.defaultProps!=null)for(o in t.defaultProps)s[o]===void 0&&(s[o]=t.defaultProps[o]);return x(t,s,i,a,null)}function x(e,r,i,a,o){var s={type:e,props:r,key:i,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:o??++n,__i:-1,__u:0};return o==null&&t.vnode!=null&&t.vnode(s),s}function S(e){return e.children}function C(e,t){this.props=e,this.context=t}function w(e,t){if(t==null)return e.__?w(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null)return n.__e;return typeof e.type==`function`?w(e):null}function T(e){if(e.__P&&e.__d){var n=e.__v,r=n.__e,i=[],a=[],o=v({},n);o.__v=n.__v+1,t.vnode&&t.vnode(o),F(e.__P,o,n,e.__n,e.__P.namespaceURI,32&n.__u?[r]:null,i,r??w(n),!!(32&n.__u),a),o.__v=n.__v,o.__.__k[o.__i]=o,te(i,o,a),n.__e=n.__=null,o.__e!=r&&E(o)}}function E(e){if((e=e.__)!=null&&e.__c!=null)return e.__e=e.__c.base=null,e.__k.some(function(t){if(t!=null&&t.__e!=null)return e.__e=e.__c.base=t.__e}),E(e)}function D(e){(!e.__d&&(e.__d=!0)&&r.push(e)&&!O.__r++||i!=t.debounceRendering)&&((i=t.debounceRendering)||a)(O)}function O(){try{for(var e,t=1;r.length;)r.length>t&&r.sort(o),e=r.shift(),t=r.length,T(e)}finally{r.length=O.__r=0}}function ee(e,t,n,r,i,a,o,s,c,l,u){var d,f,p,g,_,v,y=r&&r.__k||h,b=t.length;for(c=k(n,t,y,c,b),d=0;d<b;d++)(p=n.__k[d])!=null&&(f=p.__i!=-1&&y[p.__i]||m,p.__i=d,v=F(e,p,f,i,a,o,s,c,l,u),g=p.__e,p.ref&&f.ref!=p.ref&&(f.ref&&L(f.ref,null,p),u.push(p.ref,p.__c||g,p)),_==null&&g!=null&&(_=g),4&p.__u?(c=A(p,c,e),f.__e&&(f.__e=null)):typeof p.type==`function`&&v!==void 0?c=v:g&&(c=g.nextSibling),p.__u&=-7);return n.__e=_,c}function k(e,t,n,r,i){var a,o,s,c,l,u=n.length,d=u,f=0;for(e.__k=Array(i),a=0;a<i;a++)(o=t[a])!=null&&typeof o!=`boolean`&&typeof o!=`function`?(typeof o==`string`||typeof o==`number`||typeof o==`bigint`||o.constructor==String?o=e.__k[a]=x(null,o,null,null,null):_(o)?o=e.__k[a]=x(S,{children:o},null,null,null):o.constructor===void 0&&o.__b>0?o=e.__k[a]=x(o.type,o.props,o.key,o.ref?o.ref:null,o.__v):e.__k[a]=o,c=a+f,o.__=e,o.__b=e.__b+1,s=null,(l=o.__i=j(o,n,c,d))!=-1&&(d--,(s=n[l])&&(s.__u|=2)),s==null||s.__v==null?(l==-1&&(i>u?f--:i<u&&f++),typeof o.type!=`function`&&(o.__u|=4)):l!=c&&(l==c-1?f--:l==c+1?f++:(l>c?f--:f++,o.__u|=4))):e.__k[a]=null;if(d)for(a=0;a<u;a++)(s=n[a])!=null&&!(2&s.__u)&&(s.__e==r&&(r=w(s)),ie(s,s));return r}function A(e,t,n){var r,i;if(typeof e.type==`function`){for(r=e.__k,i=0;r&&i<r.length;i++)r[i]&&(r[i].__=e,t=A(r[i],t,n));return t}e.__e!=t&&(t&&e.type&&!t.parentNode&&(t=w(e)),t=n.insertBefore(e.__e,t||null));do t&&=t.nextSibling;while(t!=null&&t.nodeType==8);return t}function j(e,t,n,r){var i,a,o,s=e.key,c=e.type,l=t[n],u=l!=null&&!(2&l.__u);if(l===null&&s==null||u&&s==l.key&&c==l.type)return n;if(r>+!!u){for(i=n-1,a=n+1;i>=0||a<t.length;)if((l=t[o=i>=0?i--:a++])!=null&&!(2&l.__u)&&s==l.key&&c==l.type)return o}return-1}function M(e,t,n){t[0]==`-`?e.setProperty(t,n??``):e[t]=n==null?``:typeof n!=`number`||g.test(t)?n:n+`px`}function N(e,t,n,r,i){var a,o;n:if(t==`style`){if(typeof n==`string`)e.style.cssText=n;else{if(typeof r==`string`&&(e.style.cssText=r=``),r)for(t in r)n&&t in n||M(e.style,t,``);if(n)for(t in n)r&&n[t]==r[t]||M(e.style,t,n[t])}}else if(t[0]==`o`&&t[1]==`n`)a=t!=(t=t.replace(u,`$1`)),o=t.toLowerCase(),t=o in e||t==`onFocusOut`||t==`onFocusIn`?o.slice(2):t.slice(2),e.l||={},e.l[t+a]=n,n?r?n[l]=r[l]:(n[l]=d,e.addEventListener(t,a?p:f,a)):e.removeEventListener(t,a?p:f,a);else{if(i==`http://www.w3.org/2000/svg`)t=t.replace(/xlink(H|:h)/,`h`).replace(/sName$/,`s`);else if(t!=`width`&&t!=`height`&&t!=`href`&&t!=`list`&&t!=`form`&&t!=`tabIndex`&&t!=`download`&&t!=`rowSpan`&&t!=`colSpan`&&t!=`role`&&t!=`popover`&&t in e)try{e[t]=n??``;break n}catch{}typeof n==`function`||(n==null||!1===n&&t[4]!=`-`?e.removeAttribute(t):e.setAttribute(t,t==`popover`&&n==1?``:n))}}function P(e){return function(n){if(this.l){var r=this.l[n.type+e];if(n[c]==null)n[c]=d++;else if(n[c]<r[l])return;return r(t.event?t.event(n):n)}}}function F(e,n,r,i,a,o,s,c,l,u){var d,f,p,m,g,b,x,T,E,D,O,k,A,j,M,N,P=n.type;if(n.constructor!==void 0)return null;128&r.__u&&(l=!!(32&r.__u),o=[c=n.__e=r.__e]),(d=t.__b)&&d(n);n:if(typeof P==`function`){f=s.length;try{if(E=n.props,D=P.prototype&&P.prototype.render,O=(d=P.contextType)&&i[d.__c],k=d?O?O.props.value:d.__:i,r.__c?T=(p=n.__c=r.__c).__=p.__E:(D?n.__c=p=new P(E,k):(n.__c=p=new C(E,k),p.constructor=P,p.render=ae),O&&O.sub(p),p.state||(p.state={}),p.__n=i,m=p.__d=!0,p.__h=[],p._sb=[]),D&&p.__s==null&&(p.__s=p.state),D&&P.getDerivedStateFromProps!=null&&(p.__s==p.state&&(p.__s=v({},p.__s)),v(p.__s,P.getDerivedStateFromProps(E,p.__s))),g=p.props,b=p.state,p.__v=n,m)D&&P.getDerivedStateFromProps==null&&p.componentWillMount!=null&&p.componentWillMount(),D&&p.componentDidMount!=null&&p.__h.push(p.componentDidMount);else{if(D&&P.getDerivedStateFromProps==null&&E!==g&&p.componentWillReceiveProps!=null&&p.componentWillReceiveProps(E,k),n.__v==r.__v||!p.__e&&p.shouldComponentUpdate!=null&&!1===p.shouldComponentUpdate(E,p.__s,k)){n.__v!=r.__v&&(p.props=E,p.state=p.__s,p.__d=!1),n.__e=r.__e,n.__k=r.__k,n.__k.some(function(e){e&&(e.__=n)}),h.push.apply(p.__h,p._sb),p._sb=[],p.__h.length&&s.push(p),c=w(r);break n}p.componentWillUpdate!=null&&p.componentWillUpdate(E,p.__s,k),D&&p.componentDidUpdate!=null&&p.__h.push(function(){p.componentDidUpdate(g,b,x)})}if(p.context=k,p.props=E,p.__P=e,p.__e=!1,A=t.__r,j=0,D)p.state=p.__s,p.__d=!1,A&&A(n),d=p.render(p.props,p.state,p.context),h.push.apply(p.__h,p._sb),p._sb=[];else do p.__d=!1,A&&A(n),d=p.render(p.props,p.state,p.context),p.state=p.__s;while(p.__d&&++j<25);p.state=p.__s,p.getChildContext!=null&&(i=v(v({},i),p.getChildContext())),D&&!m&&p.getSnapshotBeforeUpdate!=null&&(x=p.getSnapshotBeforeUpdate(g,b)),M=d!=null&&d.type===S&&d.key==null?ne(d.props.children):d,c=ee(e,_(M)?M:[M],n,r,i,a,o,s,c,l,u),p.base=n.__e,n.__u&=-161,p.__h.length&&s.push(p),T&&(p.__E=p.__=null)}catch(e){if(s.length=f,n.__v=null,l||o!=null){if(e.then){for(n.__u|=l?160:128;c&&c.nodeType==8&&c.nextSibling;)c=c.nextSibling;o!=null&&(o[o.indexOf(c)]=null),n.__e=c}else if(o!=null)for(N=o.length;N--;)y(o[N])}else n.__e=r.__e;n.__k??=r.__k||[],e.then||I(n),t.__e(e,n,r)}}else o==null&&n.__v==r.__v?(n.__k=r.__k,n.__e=r.__e):c=n.__e=re(r.__e,n,r,i,a,o,s,l,u);return(d=t.diffed)&&d(n),128&n.__u?void 0:c}function I(e){e&&(e.__c&&(e.__c.__e=!0),e.__k&&e.__k.some(I))}function te(e,n,r){for(var i=0;i<r.length;i++)L(r[i],r[++i],r[++i]);t.__c&&t.__c(n,e),e.some(function(n){try{e=n.__h,n.__h=[],e.some(function(e){e.call(n)})}catch(e){t.__e(e,n.__v)}})}function ne(e){return typeof e!=`object`||!e||e.__b>0?e:_(e)?e.map(ne):e.constructor===void 0?v({},e):null}function re(n,r,i,a,o,s,c,l,u){var d,f,p,h,g,v,b,x=i.props||m,S=r.props,C=r.type;if(C==`svg`?o=`http://www.w3.org/2000/svg`:C==`math`?o=`http://www.w3.org/1998/Math/MathML`:o||=`http://www.w3.org/1999/xhtml`,s!=null){for(d=0;d<s.length;d++)if((g=s[d])&&`setAttribute`in g==!!C&&(C?g.localName==C:g.nodeType==3)){n=g,s[d]=null;break}}if(n==null){if(C==null)return document.createTextNode(S);n=document.createElementNS(o,C,S.is&&S),l&&=(t.__m&&t.__m(r,s),!1),s=null}if(C==null)x===S||l&&n.data==S||(n.data=S);else{if(s=C==`textarea`&&S.defaultValue!=null?null:s&&e.call(n.childNodes),!l&&s!=null)for(x={},d=0;d<n.attributes.length;d++)x[(g=n.attributes[d]).name]=g.value;for(d in x)g=x[d],d==`dangerouslySetInnerHTML`?p=g:d==`children`||d in S||d==`value`&&`defaultValue`in S||d==`checked`&&`defaultChecked`in S||N(n,d,null,g,o);for(d in S)g=S[d],d==`children`?h=g:d==`dangerouslySetInnerHTML`?f=g:d==`value`?v=g:d==`checked`?b=g:l&&typeof g!=`function`||x[d]===g||N(n,d,g,x[d],o);if(f)l||p&&(f.__html==p.__html||f.__html==n.innerHTML)||(n.innerHTML=f.__html),r.__k=[];else if(p&&(n.innerHTML=``),ee(r.type==`template`?n.content:n,_(h)?h:[h],r,i,a,C==`foreignObject`?`http://www.w3.org/1999/xhtml`:o,s,c,s?s[0]:i.__k&&w(i,0),l,u),s!=null)for(d=s.length;d--;)y(s[d]);l&&C!=`textarea`||(d=`value`,C==`progress`&&v==null?n.removeAttribute(`value`):v!=null&&(v!==n[d]||C==`progress`&&!v||C==`option`&&v!=x[d])&&N(n,d,v,x[d],o),d=`checked`,b!=null&&b!=n[d]&&N(n,d,b,x[d],o))}return n}function L(e,n,r){try{if(typeof e==`function`){var i=typeof e.__u==`function`;i&&e.__u(),i&&n==null||(e.__u=e(n))}else e.current=n}catch(e){t.__e(e,r)}}function ie(e,n,r){var i,a;if(t.unmount&&t.unmount(e),(i=e.ref)&&(i.current&&i.current!=e.__e||L(i,null,n)),(i=e.__c)!=null){if(i.componentWillUnmount)try{i.componentWillUnmount()}catch(e){t.__e(e,n)}i.base=i.__P=i.__n=null}if(i=e.__k)for(a=0;a<i.length;a++)i[a]&&ie(i[a],n,r||typeof e.type!=`function`);r||y(e.__e),e.__c=e.__=e.__e=void 0}function ae(e,t,n){return this.constructor(e,n)}function oe(n,r,i){var a,o,s,c;r==document&&(r=document.documentElement),t.__&&t.__(n,r),o=(a=typeof i==`function`)?null:i&&i.__k||r.__k,s=[],c=[],F(r,n=(!a&&i||r).__k=b(S,null,[n]),o||m,m,r.namespaceURI,!a&&i?[i]:o?null:r.firstChild?e.call(r.childNodes):null,s,!a&&i?i:o?o.__e:r.firstChild,a,c),te(s,n,c),n.props.children=null}e=h.slice,t={__e:function(e,t,n,r){for(var i,a,o;t=t.__;)if((i=t.__c)&&!i.__)try{if((a=i.constructor)&&a.getDerivedStateFromError!=null&&(i.setState(a.getDerivedStateFromError(e)),o=i.__d),i.componentDidCatch!=null&&(i.componentDidCatch(e,r||{}),o=i.__d),o)return i.__E=i}catch(t){e=t}throw e}},n=0,C.prototype.setState=function(e,t){var n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=v({},this.state);typeof e==`function`&&(e=e(v({},n),this.props)),e&&v(n,e),e!=null&&this.__v&&(t&&this._sb.push(t),D(this))},C.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),D(this))},C.prototype.render=S,r=[],a=typeof Promise==`function`?Promise.prototype.then.bind(Promise.resolve()):setTimeout,o=function(e,t){return e.__v.__b-t.__v.__b},O.__r=0,s=Math.random().toString(8),c=`__d`+s,l=`__a`+s,u=/(PointerCapture)$|Capture$/i,d=0,f=P(!1),p=P(!0);var R;function z(e,n){return t.__a&&t.__a(n),e}(R=typeof globalThis<`u`?globalThis:typeof window<`u`?window:void 0)!=null&&R.__PREACT_DEVTOOLS__&&R.__PREACT_DEVTOOLS__.attachPreact(`10.29.8`,t,{Fragment:S,Component:C});var B,V,H,U,W=0,G=[],K=t,se=K.__b,ce=K.__r,le=K.diffed,ue=K.__c,de=K.unmount,fe=K.__;function q(e,t){K.__h&&K.__h(V,e,W||t),W=0;var n=V.__H||(V.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({}),n.__[e]}function J(e){return W=1,pe(be,e)}function pe(e,t,n){var r=q(B++,2);if(r.t=e,!r.__c&&(r.__=[n?n(t):be(void 0,t),function(e){var t=r.__N?r.__N[0]:r.__[0],n=r.t(t,e);t!==n&&(r.__N=[n,r.__[1]],r.__c.setState({}))}],r.__c=V,!V.__f)){var i=function(e,t,n){if(!r.__c.__H)return!0;var i=!1,o=r.__c.props!==e;if(r.__c.__H.__.some(function(e){if(e.__N){i=!0;var t=e.__[0];e.__=e.__N,e.__N=void 0,t!==e.__[0]&&(o=!0)}}),a){var s=a.call(this,e,t,n);return i?s||o:s}return!i||o};V.__f=!0;var a=V.shouldComponentUpdate,o=V.componentWillUpdate;V.componentWillUpdate=function(e,t,n){if(this.__e){var r=a;a=void 0,i(e,t,n),a=r}o&&o.call(this,e,t,n)},V.shouldComponentUpdate=i}return r.__N||r.__}function Y(e,t){var n=q(B++,3);!K.__s&&ye(n.__H,t)&&(n.__=e,n.u=t,V.__H.__h.push(n))}function me(e){return W=5,he(function(){return{current:e}},[])}function he(e,t){var n=q(B++,7);return ye(n.__H,t)&&(n.__=e(),n.__H=t,n.__h=e),n.__}function ge(){for(var e;e=G.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some(X),t.__h.some(Z),t.__h=[]}catch(n){t.__h=[],K.__e(n,e.__v)}}}K.__b=function(e){V=null,se&&se(e)},K.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),fe&&fe(e,t)},K.__r=function(e){ce&&ce(e),B=0;var t=(V=e.__c).__H;t&&(H===V?(t.__h=[],V.__h=[],t.__.some(function(e){e.__N&&(e.__=e.__N),e.u=e.__N=void 0})):(t.__h.some(X),t.__h.some(Z),t.__h=[],B=0)),H=V},K.diffed=function(e){le&&le(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(G.push(t)!==1&&U===K.requestAnimationFrame||((U=K.requestAnimationFrame)||ve)(ge)),t.__H.__.some(function(e){e.u&&=(e.__H=e.u,void 0)})),H=V=null},K.__c=function(e,t){t.some(function(e){try{e.__h.some(X),e.__h=e.__h.filter(function(e){return!e.__||Z(e)})}catch(n){t.some(function(e){e.__h&&=[]}),t=[],K.__e(n,e.__v)}}),ue&&ue(e,t)},K.unmount=function(e){de&&de(e);var t,n=e.__c;n&&n.__H&&(n.__H.__.some(function(e){try{X(e)}catch(e){t=e}}),n.__H=void 0,t&&K.__e(t,n.__v))};var _e=typeof requestAnimationFrame==`function`;function ve(e){var t,n=function(){clearTimeout(r),_e&&cancelAnimationFrame(t),setTimeout(e)},r=setTimeout(n,35);_e&&(t=requestAnimationFrame(n))}function X(e){var t=V,n=e.__c;typeof n==`function`&&(e.__c=void 0,n()),V=t}function Z(e){var t=V;e.__c=e.__(),V=t}function ye(e,t){return!e||e.length!==t.length||t.some(function(t,n){return t!==e[n]})}function be(e,t){return typeof t==`function`?t(e):t}async function xe(e){if(!e.ok){let t=`Request failed with status ${e.status}`;try{let n=await e.json();n?.message&&(t=n.message)}catch{}throw Error(t)}return await e.json()}async function Se(e,t){return(await xe(await fetch(`${e}/public/widgets/${encodeURIComponent(t)}/config`))).data.config}async function Ce(e,t){return(await xe(await fetch(`${e}/public/widgets/${encodeURIComponent(t)}/session`,{method:`POST`}))).data}function we(e,t,n,r,i,a){return new Promise((o,s)=>{let c=new URL(`${e}/public/widgets/${encodeURIComponent(t)}/stream`);c.searchParams.set(`sessionId`,n),c.searchParams.set(`content`,r);let l=new EventSource(c.toString());l.onmessage=e=>{if(e.data===`[DONE]`){l.close(),o();return}try{let t=JSON.parse(e.data);if(t.error){l.close(),s(Error(t.error));return}if(t.sessionId)return;t.chunk&&i(t.chunk)}catch{l.close(),s(Error(`Failed to parse stream payload`))}},l.onerror=()=>{l.close(),s(Error(`Stream connection closed unexpectedly`))},a&&a.addEventListener(`abort`,()=>l.close())})}var Te=0;Array.isArray;function Q(e,n,r,i,a,o){n||={};var s,c,l=n;if(`ref`in l)for(c in l={},n)c==`ref`?s=n[c]:l[c]=n[c];var u={type:e,props:l,key:r,ref:s,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--Te,__i:-1,__u:0,__source:a,__self:o};if(typeof e==`function`&&(s=e.defaultProps))for(c in s)l[c]===void 0&&(l[c]=s[c]);return t.vnode&&t.vnode(u),u}var $=`D:/Imaz/Imaz Projects/Agent Builder/server/widget-src/WidgetApp.tsx`,Ee=({token:e,apiBaseUrl:t,origin:n,launcherText:r})=>{let[i,a]=z(J(null),`config`),[o,s]=z(J(!1),`open`),[c,l]=z(J([]),`messages`),[u,d]=z(J(``),`input`),[f,p]=z(J(!1),`loading`),[m,h]=z(J(null),`error`),[g,_]=z(J(null),`sessionId`),v=z(me(null),`scrollRef`);Y(()=>{Se(t,e).then(a).catch(e=>h(e.message))},[t,e]),Y(()=>{if(i){let e=document.getElementById(`agent-widget-root`)?.shadowRoot;e&&e.host.style.setProperty(`--ab-primary`,i.primaryColor)}},[i]),Y(()=>{v.current&&(v.current.scrollTop=v.current.scrollHeight)},[c,f]),Y(()=>{i&&i.welcomeMessage&&c.length===0&&l([{id:`welcome`,role:`bot`,content:i.welcomeMessage}])},[i,c.length]);async function y(){if(g)return g;let n=await Ce(t,e);return _(n.sessionId),n.sessionId}async function b(n){let r=(n??u).trim();if(!r||f)return;let i=String(Date.now());l(e=>[...e,{id:i,role:`user`,content:r}]),l(e=>[...e,{id:`${i}-stream`,role:`bot`,content:``}]),d(``),p(!0),h(null);try{let n=await y(),a=``;await we(t,e,n,r,e=>{a+=e,l(e=>e.map(e=>e.id===`${i}-stream`?{...e,content:a}:e))})}catch(e){h(e.message),l(e=>e.filter(e=>e.id!==`${i}-stream`))}finally{p(!1)}}let x=i?.agent?.name||`Assistant`,S=x.charAt(0).toUpperCase();return Q(`div`,{class:`ab-root`,children:[Q(`button`,{type:`button`,class:`ab-launcher`,"aria-label":`Open chat`,onClick:()=>s(e=>!e),children:o?`×`:r||`💬`},void 0,!1,{fileName:$,lineNumber:129,columnNumber:7},void 0),o&&Q(`div`,{class:`ab-panel`,role:`dialog`,"aria-label":x,children:[Q(`div`,{class:`ab-header`,children:[i?.showAvatar&&Q(`div`,{class:`ab-avatar`,children:i?.avatarUrl?Q(`img`,{src:i.avatarUrl,alt:``,referrerpolicy:`no-referrer`},void 0,!1,{fileName:$,lineNumber:144,columnNumber:19},void 0):Q(`span`,{children:S},void 0,!1,{fileName:$,lineNumber:146,columnNumber:19},void 0)},void 0,!1,{fileName:$,lineNumber:142,columnNumber:15},void 0),Q(`div`,{class:`ab-title`,children:i?.title||x},void 0,!1,{fileName:$,lineNumber:150,columnNumber:13},void 0),Q(`button`,{type:`button`,class:`ab-close`,"aria-label":`Close chat`,onClick:()=>s(!1),children:`✕`},void 0,!1,{fileName:$,lineNumber:151,columnNumber:13},void 0)]},void 0,!0,{fileName:$,lineNumber:140,columnNumber:11},void 0),m&&Q(`div`,{class:`ab-error`,children:m},void 0,!1,{fileName:$,lineNumber:156,columnNumber:21},void 0),!i&&!m&&Q(`div`,{class:`ab-welcome`,children:`Loading...`},void 0,!1,{fileName:$,lineNumber:158,columnNumber:33},void 0),i&&Q(`div`,{class:`ab-messages`,ref:v,children:[c.map(e=>Q(`div`,{class:`ab-bubble ab-bubble--${e.role}`,children:e.content},e.id,!1,{fileName:$,lineNumber:163,columnNumber:17},void 0)),f&&Q(`div`,{class:`ab-bubble ab-bubble--bot`,"aria-live":`polite`,children:`…`},void 0,!1,{fileName:$,lineNumber:168,columnNumber:17},void 0)]},void 0,!0,{fileName:$,lineNumber:161,columnNumber:13},void 0),i&&c.length<=1&&i.suggestedQuestions.length>0&&Q(`div`,{class:`ab-suggestions`,children:i.suggestedQuestions.map(e=>Q(`button`,{type:`button`,class:`ab-suggestion`,onClick:()=>b(e),disabled:f,children:e},e,!1,{fileName:$,lineNumber:178,columnNumber:17},void 0))},void 0,!1,{fileName:$,lineNumber:176,columnNumber:13},void 0),Q(`div`,{class:`ab-input-row`,children:[Q(`textarea`,{class:`ab-input`,rows:1,placeholder:`Type your message...`,value:u,disabled:f,onChange:e=>d(e.target.value),onKeyDown:e=>{e.key===`Enter`&&!e.shiftKey&&(e.preventDefault(),b())}},void 0,!1,{fileName:$,lineNumber:192,columnNumber:13},void 0),Q(`button`,{type:`button`,class:`ab-send`,disabled:f||!u.trim(),onClick:()=>b(),children:`Send`},void 0,!1,{fileName:$,lineNumber:206,columnNumber:13},void 0)]},void 0,!0,{fileName:$,lineNumber:191,columnNumber:11},void 0)]},void 0,!0,{fileName:$,lineNumber:139,columnNumber:9},void 0)]},void 0,!0,{fileName:$,lineNumber:128,columnNumber:5},void 0)};function De(){let e=document.createElement(`style`);return e.textContent=`
    :host {
      --ab-primary: #3B82F6;
      --ab-bg: #ffffff;
      --ab-text: #1f2937;
      --ab-muted: #6b7280;
      --ab-border: #e5e7eb;
      --ab-user-bg: var(--ab-primary);
      --ab-user-text: #ffffff;
      --ab-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
      --ab-radius: 12px;
      --ab-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      all: initial;
    }

    * {
      box-sizing: border-box;
    }

    .ab-launcher {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      background: var(--ab-primary);
      color: #ffffff;
      font-family: var(--ab-font);
      font-size: 22px;
      cursor: pointer;
      box-shadow: var(--ab-shadow);
      z-index: 2147483000;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s ease;
    }

    .ab-launcher:hover {
      transform: scale(1.06);
    }

    .ab-panel {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 380px;
      max-width: calc(100vw - 40px);
      height: 560px;
      max-height: calc(100vh - 120px);
      background: var(--ab-bg);
      color: var(--ab-text);
      font-family: var(--ab-font);
      border-radius: var(--ab-radius);
      box-shadow: var(--ab-shadow);
      border: 1px solid var(--ab-border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 2147483001;
      animation: ab-fade 0.15s ease;
    }

    @keyframes ab-fade {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .ab-header {
      padding: 14px 16px;
      background: var(--ab-primary);
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .ab-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 600;
      overflow: hidden;
    }

    .ab-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .ab-title {
      font-size: 15px;
      font-weight: 600;
      flex: 1;
    }

    .ab-close {
      background: transparent;
      border: none;
      color: #ffffff;
      font-size: 18px;
      cursor: pointer;
      padding: 4px 6px;
    }

    .ab-welcome {
      padding: 14px 16px;
      font-size: 13px;
      color: var(--ab-muted);
      border-bottom: 1px solid var(--ab-border);
    }

    .ab-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .ab-bubble {
      max-width: 82%;
      padding: 10px 12px;
      border-radius: var(--ab-radius);
      font-size: 14px;
      line-height: 1.45;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .ab-bubble--bot {
      background: #f3f4f6;
      color: var(--ab-text);
      align-self: flex-start;
      border-top-left-radius: 4px;
    }

    .ab-bubble--user {
      background: var(--ab-user-bg);
      color: var(--ab-user-text);
      align-self: flex-end;
      border-top-right-radius: 4px;
    }

    .ab-suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 0 16px 10px;
    }

    .ab-suggestion {
      background: #eef2ff;
      color: var(--ab-primary);
      border: 1px solid var(--ab-border);
      border-radius: 16px;
      padding: 6px 12px;
      font-size: 12px;
      font-family: var(--ab-font);
      cursor: pointer;
    }

    .ab-suggestion:hover {
      background: #e0e7ff;
    }

    .ab-input-row {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid var(--ab-border);
    }

    .ab-input {
      flex: 1;
      border: 1px solid var(--ab-border);
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 14px;
      font-family: var(--ab-font);
      color: var(--ab-text);
      outline: none;
      resize: none;
    }

    .ab-input:focus {
      border-color: var(--ab-primary);
    }

    .ab-input:disabled {
      opacity: 0.6;
    }

    .ab-send {
      background: var(--ab-primary);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 0 16px;
      font-size: 14px;
      font-family: var(--ab-font);
      cursor: pointer;
    }

    .ab-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .ab-error {
      padding: 8px 16px;
      font-size: 12px;
      color: #b91c1c;
      background: #fee2e2;
    }
  `,e}var Oe=`https://agent-builder-api.onrender.com/api/v1`;function ke(e){let t=(e.apiBaseUrl||Oe).replace(/\/$/,``),n=e.origin||window.location.origin,r=document.createElement(`div`);r.id=`agent-widget-root`,document.body.appendChild(r);let i=r.attachShadow({mode:`open`});i.appendChild(De());let a=document.createElement(`div`);i.appendChild(a),oe(b(Ee,{token:e.token,apiBaseUrl:t,origin:n,launcherText:e.launcherText}),a)}window.AgentWidget={init:e=>{if(!e?.token){console.error(`[AgentWidget] Missing required option: token`);return}document.getElementById(`agent-widget-root`)||ke(e)}}})();