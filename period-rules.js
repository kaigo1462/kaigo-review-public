// User-defined operational ranges, revised 2026-09-17. Change applications: 3–36 months.
// Reference sources below do not establish this user-defined change-application range.
// https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/kaigo_koureisha/nintei/gaiyo4.html
// https://www.mhlw.go.jp/content/12300000/000598356.pdf (new/change)
// https://www.mhlw.go.jp/content/000819417.pdf (unstable condition)
const PERIOD_RULES={min:3,new:{standard:6,max:12},change:{standard:6,max:36},renewal:{standard:12,sameMax:48,differentMax:36},unstableMax:6};
function checkPeriod(c,a){
 if(['非該当','却下'].includes(a.grade))return null;
 const validGrade=g=>/^要(?:支援[12]|介護[1-5])$/.test(g||'');
 let rule,basis,unknown=false;
 if(c.type==='新規申請'){rule=PERIOD_RULES.new;basis='新規申請'}
 else if(c.type==='区分変更申請'){rule=PERIOD_RULES.change;basis='区分変更申請'}
 else if(c.type==='更新申請'){
  unknown=!validGrade(c.previous);const same=c.previous===a.grade;
  rule={standard:PERIOD_RULES.renewal.standard,max:unknown?null:same?PERIOD_RULES.renewal.sameMax:PERIOD_RULES.renewal.differentMax};
  basis=unknown?'更新申請：前回判定が未登録、または比較できない値です':`更新申請：前回 ${c.previous} → 今回 ${a.grade}（${same?'同じ':'異なる'}区分）`;
 }else return {level:'注意',messages:['申請区分を確認できないため、期間の範囲を判定できません。事務局に確認してください。'],basis:c.type||'申請区分未登録'};
 const messages=[];let strong=false;
 if(unknown)messages.push('前回判定を確認できないため、上限が36か月か48か月かを判定できません。事務局に確認してください。');
 if(a.months<PERIOD_RULES.min||(rule.max!==null&&a.months>rule.max)||(unknown&&a.months>PERIOD_RULES.renewal.sameMax)){
  strong=true;messages.push('このシステムで設定した認定有効期間の範囲外です。入力内容を確認してください。');
 }else if(a.months!==rule.standard)messages.push(`原則の認定有効期間（${rule.standard}か月）と異なります。入力内容を確認してください。`);
 if(a.grade==='要介護1'&&a.reason==='① 状態不安定'&&a.months>PERIOD_RULES.unstableMax)messages.push('① 状態不安定の場合、認定有効期間は6か月以内に設定することが適当とされています。');
 if(!messages.length)return null;
 return {level:strong?'強い警告':'注意',messages,basis:`${basis}。原則 ${rule.standard}か月 ／ 設定可能範囲 ${PERIOD_RULES.min}〜${rule.max??'36または48'}か月`};
}
if(typeof module!=='undefined')module.exports={PERIOD_RULES,checkPeriod};
